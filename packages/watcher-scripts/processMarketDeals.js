const fs = require("fs");
const { MongoClient } = require("mongodb");

async function getLastHeight(statsCollection) {
  const result = await statsCollection.find().limit(1).toArray();
  return (result?.latestHeight || 0);
}

async function updateStats(dealsCollection, statsCollection, height) {
  const stats = {latestHeight: height};
  let queryResults;
  queryResults = await dealsCollection
    .aggregate(
      [
        {$match: {'Proposal.EndEpoch': {$gte: height}, 'State.SectorStartEpoch': {$gt: -1}}},
        {$group: {_id: '$Proposal.Client'}},
        {$group: {_id: 1, count: {$sum: 1}}}
      ],
      {allowDiskUse: true},
    ).toArray()
  stats.numberOfUniqueClients = queryResults.length > 0 ? queryResults[0].count : 0;
  
  queryResults = await dealsCollection
    .aggregate(
      [
        {$match: {'Proposal.EndEpoch': {$gte: height}, 'State.SectorStartEpoch': {$gt: -1}}},
        {$group: {_id: '$Proposal.Provider'}},
        {$group: {_id: 1, count: {$sum: 1}}},
      ],
      {allowDiskUse: true},
    ).toArray()
  stats.numberOfUniqueProviders = queryResults.length > 0 ? queryResults[0].count : 0;
  
  queryResults = await dealsCollection
    .aggregate(
      [
        {$match: {'Proposal.EndEpoch': {$gte: height}, 'State.SectorStartEpoch': {$gt: -1}}},
        {$group: {_id: '$Proposal.PieceCID'}},
        {$group: {_id: 1, count: {$sum: 1}}},
      ],
      {allowDiskUse: true},
    ).toArray()
  stats.numberOfUniqueCIDs = queryResults.length > 0 ? queryResults[0].count : 0;
  
  queryResults = await dealsCollection
    .aggregate(
      [
        {$match: {'Proposal.EndEpoch': {$gte: height}, 'State.SectorStartEpoch': {$gt: -1}}},
        {$group: {_id: 1, count: {$sum: '$Proposal.PieceSize'}}},
      ],
      {allowDiskUse: true},
    ).toArray()
  stats.totalDealSize = queryResults.length > 0 ? queryResults[0].count : 0;
  
  queryResults = await dealsCollection
    .aggregate(
      [
        {$match: {'Proposal.EndEpoch': {$gte: height}, 'State.SectorStartEpoch': {$gt: -1}}},
        {$group: {_id: 1, count: {$sum: 1}}},
      ],
      {allowDiskUse: true},
    ).toArray()
  stats.totalDeals = queryResults.length > 0 ? queryResults[0].count : 0;
  
  return statsCollection.bulkWrite([
    {
      replaceOne: {
        filter: {_id: 1},
        replacement: stats,
        upsert: true,
      },
    },
  ])
}

async function updateStatus(statusCollection, height) {
  return statusCollection.bulkWrite([
    {
      insertOne: { height, success: true }
    }
  ])
}

async function processMarketDeals(options) {
  const { client, dbName, currentHeight, filePath } = options;
  
  await client.connect();
  const db = client.db(dbName);
  const dealsCollection = db.collection('deals');
  const statsCollection = db.collection('stats');
  const statusCollection = db.collection('status');
  
  const lastHeight = await getLastHeight(statsCollection);
  const readableStream = fs.createReadStream(filePath, 'utf8');
  
  let buffer = '';
  let isFirstLine = true;
  let dealsUpdated = 0;
  
  let deals = [];
  let promises = [];
  
  return (new Promise((resolve, reject) => {
    readableStream.on('error', function (error) {
      reject(`error: ${error.message}`);
    })

    readableStream.on('data', (chunk) => {
      if (isFirstLine) {
        chunk = chunk.substring(27);
        isFirstLine = false;
      }
    
      buffer += chunk;

      let rDelimiter = buffer.indexOf('}},');
      while (rDelimiter !== -1) {
        let record = buffer.substring(0, rDelimiter + 2);
        if (record.endsWith('}}}')) {
          record = record.substring(0, record.length - 1);
        }
      
        const kvDelimiter = record.indexOf('":{');
        const key = record.substring(1, kvDelimiter);
        const rawValue = record.substring(kvDelimiter + 2);

        const value = JSON.parse(rawValue);
        if (value?.State?.LastUpdatedEpoch > lastHeight
          || (value?.State?.LastUpdatedEpoch === -1 && value?.Proposal?.StartEpoch > lastHeight)
        ) {
          if (deals.length >= 1000) {
            promises.push(dealsCollection.bulkWrite(deals, { ordered: false }));
            dealsUpdated += deals.length;
            deals = [];
          }
          value.DealID = parseInt(key, 10);
          deals.push({
            replaceOne: {
              filter: {_id: value.DealID},
              replacement: value,
              upsert: true,
            }
          });
        }
        buffer = buffer.substring(rDelimiter + 3);
        rDelimiter = buffer.indexOf('}},');
      }
    })
  
    readableStream.on('end', () => {
      if (deals.length > 0) {
        promises.push(dealsCollection.bulkWrite(deals, { ordered: false }));
        dealsUpdated += deals.length;
      }
      Promise.all(promises).then(() => {
        updateStats(dealsCollection, statsCollection, currentHeight).then(() => {
          updateStatus(statusCollection, currentHeight).then(() => {
            resolve(`Total deals updated: ${dealsUpdated}`);
          }).catch(reject)
        }).catch(reject)
      });
    })
  }))
  
}

function main() {
  const [,,mongoUrl, dbName, currentHeight, filePath] = process.argv;
  const client = new MongoClient(mongoUrl, {useUnifiedTopology: true});
  
  processMarketDeals({ client, dbName, currentHeight: parseInt(currentHeight, 10), filePath })
    .then(console.log)
    .catch(console.log)
    .finally(() => client.close());
}

main()
