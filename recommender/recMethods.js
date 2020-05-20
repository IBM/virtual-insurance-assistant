require('dotenv').config({
  silent: true,
});

let naturalLanguageUnderstanding = false;
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
if (process.env.NATURAL_LANGUAGE_UNDERSTANDING_APIKEY) {
  naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2020-05-14',
  });
} else {
  console.log('NLU service not configured');
}

const reviews = require('./reviewsList.json');
const shops = require('./businesses.json');

const classifyDamage = function (input) {
  if (!naturalLanguageUnderstanding) {
    return Promise.resolve(); // "N/A"
  }
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
        return type[0];
      } else {
        console.log('no repair type detected');
        return Promise.resolve(); // "N/A"
      }
    })
    .catch((err) => {
      console.log('error:', err);
    });
};

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

const filterByType = function (countPerBusiness, type) {
  return Object.keys(countPerBusiness).filter((c) => countPerBusiness[c][type]);
};

const sortByType = function (countPerBusiness, filteredBusinessIds, type) {
  const sortedIds = filteredBusinessIds.sort((a, b) => countPerBusiness[b][type]['positive'] - countPerBusiness[a][type]['positive']);
  const topResults = sortedIds.slice(0, 5);
  return topResults;
};

const getRankings = function (type) {
  console.log('ranking businesses by type');
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

module.exports = {
  classifyDamage: classifyDamage,
  sortByType: sortByType,
  filterByType: filterByType,
  getRankings: getRankings,
};
