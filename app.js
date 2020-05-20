/**
 * Copyright 2017-2020 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

require('dotenv').config({
  silent: true,
});

const users = require('./recommender/mockUsers.json');
const recMethods = require('./recommender/recMethods.js');

const express = require('express'); // app server
const bodyParser = require('body-parser'); // parser for post requests

const AssistantV2 = require('ibm-watson/assistant/v2');
const DiscoveryV1 = require('ibm-watson/discovery/v1');
const { getAuthenticatorFromEnvironment } = require('ibm-watson/auth');

// HEY! Bump the API version dates here (to yesterday) when updating and TESTING.
const ASST_API_VERSION = '2020-05-04';
const DISCO_API_VERSION = '2020-05-04';

// Optional Watson Assistant client, if configured
const assistantId = process.env.ASSISTANT_ID;
let assistant = false;
if (assistantId) {
  // need to manually set url and disableSslVerification to get around
  // current Cloud Pak for Data SDK issue IF user uses
  // `CONVERSATION_` prefix in run-time environment.
  let url;
  let disableSSL = false;

  let auth;
  try {
    // ASSISTANT should be used
    auth = getAuthenticatorFromEnvironment('assistant');
    url = process.env.ASSISTANT_URL;
    if (process.env.ASSISTANT_DISABLE_SSL === 'true') {
      disableSSL = true;
    }
  } catch (e) {
    // but handle if alternate CONVERSATION is used
    auth = getAuthenticatorFromEnvironment('conversation');
    url = process.env.CONVERSATION_URL;
    if (process.env.CONVERSATION_DISABLE_SSL === 'true') {
      disableSSL = true;
    }
  }

  // Truncate to allow the /v2/ URL from API Details to work.
  if (url) {
    url = url.split('/v2/')[0];
  }

  assistant = new AssistantV2({
    version: ASST_API_VERSION,
    authenticator: auth,
    url: url,
    disableSslVerification: disableSSL,
  });
}

// Optional Watson Discovery client, if configured
let discovery = false;
const discoveryParams = {};
if (process.env.DISCOVERY_COLLECTION_ID) {
  discovery = new DiscoveryV1({
    version: DISCO_API_VERSION,
  });
  discoveryParams.collectionId = process.env.DISCOVERY_COLLECTION_ID;
  discoveryParams.environmentId = process.env.DISCOVERY_ENVIRONMENT_ID;
}

const DISCOVERY_ACTION = 'disco';

const app = express();
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Chatbot endpoint to be called from the client side
app.post('/api/message', async (req, res) => {
  if (!assistant) {
    const text = 'No Watson Assistant. Please configure the runtime environment and restart the server.';
    return res.json({ output: { generic: [{ response_type: 'text', text }] } });
  }

  const sessionId = (req.body.context && req.body.context.global.session_id) || (await assistant.createSession({ assistantId: assistantId })).result.session_id;
  console.log('SID: ', sessionId);

  // Add customerId to the context as if somebody logged in.
  if (!req.body.context) {
    req.body.context = { skills: { 'main skill': { user_defined: { customerId: 'user1234' } } } };
  }

  const input = req.body.input || {};
  input.options = { return_context: true };

  const payload = {
    assistantId: assistantId,
    sessionId: sessionId,
    input: input,
    context: req.body.context,
  };

  callAssistant(payload);

  /**
   * Send the input to the Assistant service. Optionally, NLU first.
   * @param params
   */
  function callAssistant(params) {
    console.log('Assistant params: ', params);
    assistant.message(params, function (err, data) {
      if (err) {
        console.log('assistant.message error: ', err);
        return res.json({ output: { generic: [{ response_type: 'text', text: err.message }] } });
      } else {
        console.log('assistant.message result: ', JSON.stringify(data.result, null, 2));
        checkForLookupRequests(params, data, function (err, data) {
          if (err) {
            console.log(err);
            return res.status(err.code || 500).json(err);
          } else {
            return res.json(data);
          }
        });
      }
    });
  }
});

/**
 * Looks for actions requested by Assistant service and provides the requested data.
 */
function checkForLookupRequests(input, output, callback) {
  console.log('checkForLookupRequests');
  const data = output.result;
  console.log('Assistant result to act on: ' + JSON.stringify(data, null, 2));

  const mainContext = data.context.skills['main skill'] || {};

  // TODO: How can we handle a webhook config error here or in the dialog?
  if (data.output.user_defined && data.output.user_defined.webhook_error) {
    const webhook_error = data.output.user_defined.webhook_error;
    console.log('webhook error: ', webhook_error);
    Object.keys(webhook_error).forEach((k) => console.log(`key=${k} message=${webhook_error[k].message}`));
  }

  if (data.output.generic.length && data.output.generic[0].response_type === 'search') {
    data.output.generic.push({ response_type: 'text', text: data.output.generic[0].results[0].highlight.text[0] });
    callback(null, data);
  } else if (
    // Lookups using an action set in context.
    mainContext.user_defined &&
    mainContext.user_defined.action &&
    mainContext.user_defined.action.lookup &&
    mainContext.user_defined.action.lookup !== 'complete'
  ) {
    const payload = {
      workspaceId: assistantId,
      context: data.context,
      input: input.input,
    };

    console.log('mainContext.user_defined.action.lookup: ', mainContext.user_defined.action.lookup);
    // Assistant requests a data lookup action
    // Only call Discovery directly if configured. Ideally Assistant
    // did this for us with the search skill.
    if (mainContext.user_defined.action.lookup === DISCOVERY_ACTION) {
      // Mark the context's action complete so we don't use it over and over.
      mainContext.user_defined.action.lookup = 'complete';

      // query to trigger this action - "can I use an atm in any city"
      console.log('************** Discovery *************** InputText : ' + payload.input.text);
      let discoveryResponse = '';
      if (!discovery) {
        console.log('Discovery is not ready configured. Add runtime environment vars and restart server.');
        discoveryResponse = 'Sorry, currently I do not have a response. Discovery is not configured.';
        if (data.output.generic) {
          data.output.generic.push({ response_type: 'text', text: discoveryResponse });
        }
        callback(null, data);
      } else {
        const queryParams = {
          naturalLanguageQuery: payload.input.text,
          passages: true,
        };
        Object.assign(queryParams, discoveryParams);
        discovery.query(queryParams, (err, searchResponse) => {
          discoveryResponse = 'Sorry, currently I do not have a response. Our Customer representative will get in touch with you shortly.';

          if (err) {
            console.error('Error searching for documents: ' + err);
          } else if (searchResponse.result.matching_results > 0) {
            // we have a valid response from Discovery
            // now check if we are using SDU or just a simple document query
            let bestLine;
            // console.log('Disco result: ' + JSON.stringify(searchResponse, null, 2));
            let bestScore = 0;
            if (searchResponse.result.results[0].text) {
              for (let i = 0, size = searchResponse.result.results.length; i < size; i++) {
                if (searchResponse.result.results[i].result_metadata['confidence'] > bestScore) {
                  bestLine = searchResponse.result.results[i].text;
                  bestScore = searchResponse.result.results[i].result_metadata['confidence'];
                }
              }
              console.log('**** Returning highest confidence text response to customer ****');
              console.log(bestLine);
            } else if ('passages' in searchResponse.result && searchResponse.result.passages.length) {
              console.log('Using Passage feature');
              // use Passage feature
              const bestPassage = searchResponse.result.passages[0];
              console.log('Passage score: ', bestPassage.passage_score);
              console.log('Passage text: ', bestPassage.passage_text);
              // set a default value
              bestLine = bestPassage.passage_text;

              // Trim the passage to try to get just the answer part of it.
              const lines = bestPassage.passage_text.split('.');

              // just use the first sentence in the response.
              // if it contains a question mark, use the portion after it
              const line = lines[0].trim();
              if (line.indexOf('?') > -1) {
                const subline = line.split('?');
                bestLine = subline[1];
              } else {
                bestLine = line;
              }
            } else {
              console.log('Using default response');
              // other formats, like from CPD (non-SDU)
              if ('text' in searchResponse.result.results[0]) {
                const lines = searchResponse.result.results[0].text.split('.');
                const line = lines[0].trim();
                if (line.indexOf('?') > -1) {
                  const subline = line.split('?');
                  bestLine = subline[1];
                } else {
                  bestLine = line;
                }
              }
            }
            discoveryResponse =
              bestLine || 'Sorry I currently do not have an appropriate response for your query. Our customer care executive will call you in 24 hours.';
          }

          if (data.output.generic) {
            data.output.generic.push({ response_type: 'text', text: discoveryResponse });
          }
          console.log('Discovery response: ' + discoveryResponse);
          callback(null, data);
        });
      }
    } else {
      callback(null, data);
    }
  } else if (data.output.intents.length > 0 && data.output.intents[0]['intent'] == 'describe_damage') {
    const description = input.input.text;
    recMethods
      .classifyDamage(description)
      .then((result) => {
        if (data.output.generic && result) {
          console.log('response received');
          console.log(JSON.stringify(data.output));
          const recommendations = recMethods.getRankings(result);
          const shopNames = recommendations.map((r, idx) => `${r[0].name}`);
          const shopNamesString = '\n\n' + recommendations.map((r, idx) => `${idx}. ${r[0].name}`).join('\n');
          const recResponse = {
            damage_description: result,
            recs: shopNames,
            recsString: shopNamesString,
          };
          const responsePrefix = `It sounds like you need a mechanic that specializes in "${result}" repairs. Here are a few suggestions for mechanics near you. Would you like to select one? `;
          // set context
          data.context.skills['main skill']['user_defined'].recResponse = recResponse;
          const r = { response_type: 'text', text: responsePrefix + shopNamesString };
          data.output.generic.push(r);
          callback(null, data);
        } else {
          const r = { response_type: 'text', text: 'Unable to determine repair type. Is NLU configured?' };
          data.output.generic.push(r);
          callback(null, data);
        }
      })
      .catch((err) => {
        console.log(err);
        callback(null, data);
      });
  } else if (data.output.intents.length > 0 && data.output.intents[0]['intent'] == 'Insurance_View_Claim_Status') {
    // lookup claim status
    const userId = data.context.skills['main skill']['user_defined']['customerId'];
    const userList = users.filter((user) => user.id.toLowerCase() == userId.toLowerCase());
    if (userList.length > 0 && userList[0].claims.length > 0) {
      const user = userList[0];
      // returning latest claim in array
      const latestClaim = user.claims.slice(-1)[0];
      console.log(`retrieved claim ${JSON.stringify(latestClaim)}`);
      data.context.skills['main skill']['user_defined'].claim = latestClaim;
      const response = `You have a ${latestClaim.status} claim. Your vehicle is being serviced at "${latestClaim.assignedMech}"`;
      const r = { response_type: 'text', text: response };
      data.output.generic.push(r);
      console.log(`updated context ${JSON.stringify(data)}`);
      callback(null, data);
    } else {
      callback(null, data);
    }
  } else if (data.output.generic && data.output.generic.filter((r) => r.text.includes('Assigning') && r.text.includes('to your claim')).length > 0) {
    console.log('adding mechanic to claim');
    // lookup mechanic from selection
    const selection = data.output.entities.filter((e) => e.entity == 'sys-number');
    const mechanicIdx = selection[0].value;
    const mechanic = data.context.skills['main skill']['user_defined']['recResponse']['recs'][mechanicIdx];
    // lookup user from context
    const userId = data.context.skills['main skill']['user_defined']['customerId'];
    const userIdx = users.findIndex((user) => user.id == userId);
    if (userIdx != -1) {
      // assign mechanic to user
      users[userIdx].claims.slice(-1)[0].assignedMech = mechanic;
      callback(null, data);
    } else {
      callback(null, data);
    }
  } else {
    // anything_else
    callback(null, data);
  }
}

const config = `
Watson Assistant configured to use...<br/>
<br/>
ASSISTANT_ID = ${assistantId}</br>
<br/>
`;

// Testing a status page
app.get('/config', (req, res) => res.send(config));

module.exports = app;
