const express = require('express');
const router = express.Router();
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');

// load review/users metadata
const users = require('../recommender/mockUsers.js');
const reviews = require('../recommender/reviewsList.json');
const shops = require('../recommender/businesses.json');

require('dotenv').config();

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2020-05-14',
});

// get repair breakdown by business and type
const getRepairCount = function (reviews) {
  let complete = false;
  const countPerBusiness = {};
  reviews.map((review, lIdx) => {
    const entities = review['entities'];
    const businessId = review['business_id'];
    const sentiment = review['sentiment'];
    if (!Object.keys(countPerBusiness).includes(businessId)) {
      countPerBusiness[businessId] = { total: { positive: 0, negative: 0, neutral: 0 } };
    }
    entities.map((entity, eIdx) => {
      const repairType = entity['disambiguation']['subtype'][0];
      if (!Object.keys(countPerBusiness[businessId]).includes(repairType)) {
        countPerBusiness[businessId][repairType] = { positive: 0, negative: 0, neutral: 0 };
      }
      countPerBusiness[businessId]['total'][sentiment] += 1;
      countPerBusiness[businessId][repairType][sentiment] += 1;
      if (lIdx == reviews.length - 1 && eIdx == entities.length - 1) {
        complete = true;
      }
    });
    if (entities.length < 1 && lIdx == reviews.length - 1) {
      // if list empty
      console.log(`loaded ${reviews.length} reviews`);
      complete = true;
      // return countPerBusiness
    }
  });
  if (complete) {
    return countPerBusiness;
  }
};

const countPerBusiness = getRepairCount(reviews);

const geocodeUserLocation = function (user) {
  const metersPerLatitudeDegree = 111319.488 * Math.cos(user.personalInfo.latitude);
  const metersPerLongitudeDegree = 111120;
  const metersPerMile = 1609.34;
  const miles = 10;

  const metersRange = metersPerMile * miles;

  const latDegreeRange = Math.abs(metersRange / metersPerLatitudeDegree);
  const lonDegreeRange = Math.abs(metersRange / metersPerLongitudeDegree);
  return [latDegreeRange, lonDegreeRange];
};

const filterByLocation = function (shops, user) {
  const g = geocodeUserLocation(user);
  const latDegreeRange = g[0];
  const lonDegreeRange = g[1];

  return shops.filter(
    (shop) =>
      shop.state == user.personalInfo.state &&
      shop.city == user.personalInfo.city &&
      Math.abs(shop['longitude']) - Math.abs(user.personalInfo['longitude']) < lonDegreeRange &&
      Math.abs(shop['latitude']) - Math.abs(user.personalInfo['latitude']) < latDegreeRange
  );
};

const filterByType = function (countPerBusiness, type) {
  return Object.keys(countPerBusiness).filter((c) => countPerBusiness[c][type]);
};

const sortByType = function (countPerBusiness, filteredBusinessIds, type) {
  const sortedIds = filteredBusinessIds.sort((a, b) => countPerBusiness[b][type]['positive'] - countPerBusiness[a][type]['positive']);
  const topResults = sortedIds.slice(0, 5);
  return topResults;
};

const getRankings = function (type) {
  // const type = 'Engine'
  const filteredBusinessIds = filterByType(countPerBusiness, type);
  const topBusinessIds = sortByType(countPerBusiness, filteredBusinessIds, type);
  const topBusinesses = topBusinessIds.map((id) => {
    countPerBusiness[id]['businessId'] = id;
    const shop = shops.filter((s) => s.id == id);
    shop['repair_counts'] = countPerBusiness[id];
    console.log(countPerBusiness[id]);
    return shop;
  });
  return topBusinesses;
};

const classifyDamage = function (input) {
  const analyzeParams = {
    text: input,
    features: {
      entities: {
        model: process.env.NATURAL_LANGUAGE_UNDERSTANDING_MODEL_ID,
      },
    },
  };
  console.log(`analyzing input ${input}`);
  return naturalLanguageUnderstanding
    .analyze(analyzeParams)
    .then((analysisResults) => {
      console.log(JSON.stringify(analysisResults, null, 2));
      console.log(`analysisResults ${JSON.stringify(analysisResults)}`);
      if (analysisResults.result.entities && analysisResults.result.entities.length > 0) {
        const type = analysisResults.result.entities.map((e) => e.disambiguation.subtype[0]);
        console.log(`${type} repair requested`);
        return type;
      } else {
        console.log('no repair type detected');
        return null; // "N/A"
      }
    })
    .catch((err) => {
      console.log('error:', err);
    });
};

// handle query from assistant
router.post('/assistant', function (req, res, next) {
  // classify user incident description
  if (req.body.type == 'description') {
    // user describes incident, we use NLU to determine repair type
    const description = req.body.text;
    console.log(`classifying: ${description}`);
    classifyDamage(description).then((type) => {
      if (! type) {throw new Error('no repair type detected')}
      const recommendations = getRankings(type);
      console.log(`recommendations ${JSON.stringify(recommendations)}`);
      const shopNames = recommendations.map((r, idx) => `${r[0].name}`);
      const shopNamesString = '\n\n' + recommendations.map((r, idx) => `${idx}. ${r[0].name}`).join('\n');
      const payload = {
        damage_description: type[0],
        recs: shopNames,
        recsString: shopNamesString,
      };
      res.json(payload);
    }).catch((err) => {
      res.json({"message": "Error: ${JSON.stringify(err)}"})
    })
  }

  // user retrieves claim
  else if (req.body.type == 'retrieveClaim') {
    // Lookup user.
    // const name = "John Doe"
    // const name = req.body.userName
    // const users = users.filter( user => user.personalInfo.name.toLowerCase() == name.toLowerCase())

    const id = req.body.userId;
    const userSelect = users.filter((user) => user.id.toLowerCase() == id.toLowerCase());

    if (userSelect.length > 0 && userSelect[0].claims.length > 0) {
      // TODO, selecting first user, lastest claim for now .. add dialog to let user select from claims at some point
      const user = userSelect[0];
      // const numClaims = user.claims.length;
      // returning last claim in array
      console.log(user.claims.slice(-1)[0]);
      res.json(user.claims.slice(-1)[0]);
    } else {

      res.json({ message: 'failed' });
    }
  }

  // user submits claim
  else if (req.body.type == 'submitClaim') {
    const mechanic = req.body.mechanic || null;
    const damageType = req.body.damageType;
    const name = 'John Doe';
    let userIdx = users.findIndex((user) => user.personalInfo.name.toLowerCase() == name.toLowerCase());
    // TODO, selecting first user for now until we test w/context
    userIdx = 0;
    if (userIdx != -1) {
      // generate claim
      const claim = {
        id: 'claim_' + Date.now(),
        type: damageType,
        status: 'new',
        assignedMech: mechanic,
        // vehicle: user.vehicles[0]['id']
      };
      console.log('appending claim');
      users[userIdx].claims.push(claim);
      res.json(users[userIdx].claims);
    } else {
      res.json({
        message: 'User not found',
      });
    }
  }

  // user requests recommendation for mechanic of given type
  else if (req.body.type == 'updateUserInfo') {
    const id = req.body.userId;
    // TODO, fill out dialog, determine key for info
    const info = req.body.information;
    const userIdx = users.findIndex((user) => user.id == id);
    // users[userIdx].personalInfo[]
    // res.json()
  }

  // user requests recommendation for mechanic of given type
  else if (req.body.type == 'recommend') {
    const repairType = req.body.repairType;
    const rankings = getRankings(repairType);
    console.log(rankings);
    res.json(rankings);
  }

  else {
    res.sendStatus(404)
    res.json({"message": "type not recognized"})
  }

});

router.get('/ping', function (req, res, next) {
  res.send(200);
});

module.exports = router;
