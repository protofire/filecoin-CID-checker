#!/bin/bash
set -eou pipefail;

sdate="$(date +%s)"

export dbhost=localhost
export dbport=27017
export dbname=filecoindb_test

fcnode=https://calibration.node.glif.io/archive/lotus/rpc/v0

step=1000

output=StateMarketDeals.json

rm -rf ./tmp
mkdir -p tmp && mkdir -p "logs_$sdate/parallel"

height=$(curl -s -H "Content-Type:application/json"\
  --data '{ "jsonrpc":"2.0", "method":"Filecoin.ChainHead", "params":[], "id":1 }'\
  $fcnode\
  | jq '.result.Height')
printf 'Current height: %s \n' "$height" >> "logs_$sdate/log.log"

latestHeight=$(mongosh --quiet --host $dbhost --port $dbport --eval "
    db = db.getSiblingDB('$dbname');
    [result]=db.getCollection('stats').find().limit(1).toArray();
    print(result?.latestHeight || 0)
  ")
printf 'Last processed height: %s \n' "$latestHeight" >> "logs_$sdate/log.log"

printf '[%s] Fetching deals \n' "$(date +%m-%d-%Y:%H:%M:%S)" >> "logs_$sdate/log.log"
curl -o $output -X POST\
  -H "Content-Type:application/json"\
  --data '{ "jsonrpc":"2.0", "method":"Filecoin.StateMarketDeals", "params":[[]], "id":1 }'\
  $fcnode

writeBatch () {
deals=$(jq -s '.' "$1")
mongosh --quiet --host $dbhost --port $dbport --eval "
  db = db.getSiblingDB('$dbname');
  var deals = (${deals}).map((el) => {
    el.value.DealID = parseInt(el.key, 10);
    return {
      replaceOne: {
        filter: {_id: el.value.DealID},
        replacement: el.value,
        upsert: true,
      }
   }
  })
  db.deals.bulkWrite(deals);
"
}
export -f writeBatch

printf '[%s] Processing and filtering raw deals \n' "$(date +%m-%d-%Y:%H:%M:%S)" >> "logs_$sdate/log.log"
jq -c --argjson lh "$latestHeight" '.result | to_entries | .[] | select(.value.State.LastUpdatedEpoch == -1 or .value.State.LastUpdatedEpoch > $lh)' $output | split -a 5 -l $step - ./tmp/entries-batch_

printf '[%s] Writing deals to DB \n' "$(date +%m-%d-%Y:%H:%M:%S)" >> "logs_$sdate/log.log"
parallel --tmpdir "./logs_$sdate/parallel" --files writeBatch {} ::: ./tmp/* > /dev/null

getNumberOfUniqueClients () {
mongosh --quiet --host $dbhost --port $dbport --eval "
  db = db.getSiblingDB('$dbname');
  [result] = db.deals.aggregate(
    [
      {
        \$match: {
          'Proposal.EndEpoch': {\$gte: $height},
          'State.SectorStartEpoch': {\$gt: -1},
        },
      },
      {
        \$group: {
          _id: '\$Proposal.Client',
        },
      },
      {
        \$group: {
          _id: 1,
          count: {\$sum: 1},
        },
      },
    ],
    {allowDiskUse: true},
  ).toArray();

  print(result.count);
"
}

getNumberOfUniqueProviders () {
mongosh --quiet --host $dbhost --port $dbport --eval "
  db = db.getSiblingDB('$dbname');
  [result] = db.deals.aggregate(
    [
      {
        \$match: {
          'Proposal.EndEpoch': {\$gte: $height},
          'State.SectorStartEpoch': {\$gt: -1},
        },
      },
      {
        \$group: {
          _id: '\$Proposal.Provider',
        },
      },
      {
        \$group: {
          _id: 1,
          count: {\$sum: 1},
        },
      },
    ],
    {allowDiskUse: true},
  ).toArray();

  print(result.count);
"
}

getNumberOfUniqueCIDs () {
mongosh --quiet --host $dbhost --port $dbport --eval "
  db = db.getSiblingDB('$dbname');
  [result] = db.deals.aggregate(
    [
      {
        \$match: {
          'Proposal.EndEpoch': {\$gte: $height},
          'State.SectorStartEpoch': {\$gt: -1},
        },
      },
      {
        \$group: {
          _id: '\$Proposal.PieceCID',
        },
      },
      {
        \$group: {
          _id: 1,
          count: {\$sum: 1},
        },
      },
    ],
    {allowDiskUse: true},
  ).toArray();

  print(result.count);
"
}

getTotalDealSize () {
mongosh --quiet --host $dbhost --port $dbport --eval "
  db = db.getSiblingDB('$dbname');
  [result] = db.deals.aggregate(
    [
      {
        \$match: {
          'Proposal.EndEpoch': {\$gte: $height},
          'State.SectorStartEpoch': {\$gt: -1},
        },
      },
      {
        \$group: {
          _id: 1,
          count: {\$sum: '\$Proposal.PieceSize'},
        },
      },
    ],
    {allowDiskUse: true},
  ).toArray();

  print(result.count);
"
}

getTotalDeals () {
mongosh --quiet --host $dbhost --port $dbport --eval "
  db = db.getSiblingDB('$dbname');
  [result] = db.deals.aggregate(
    [
      {
        \$match: {
          'Proposal.EndEpoch': {\$gte: $height},
          'State.SectorStartEpoch': {\$gt: -1},
        },
      },
      {
        \$group: {
          _id: 1,
          count: {\$sum: 1},
        },
      },
    ],
    {allowDiskUse: true},
  ).toArray();

  print(result.count);
"
}

writeStats () {
mongosh --quiet --host $dbhost --port $dbport --eval "
  db = db.getSiblingDB('$dbname');
  db.getCollection('stats').bulkWrite([
    {
      replaceOne: {
        filter: {_id: 1},
        replacement: {
          'latestHeight': $height,
          'numberOfUniqueClients': $1,
          'numberOfUniqueProviders': $2,
          'numberOfUniqueCIDs': $3,
          'totalDealSize': $4,
          'totalDeals': $5,
        },
        upsert: true,
      },
    },
  ]);
"
}

writeStatus () {
mongosh --quiet --host $dbhost --port $dbport --eval "
  db = db.getSiblingDB('$dbname');
  db.status.bulkWrite([
    {
      insertOne: {
        'height': $height,
        'success': true,
      }
    }
  ]);
"
}

numberOfUniqueClients=$(getNumberOfUniqueClients)
numberOfUniqueProviders=$(getNumberOfUniqueProviders)
numberOfUniqueCIDs=$(getNumberOfUniqueCIDs)
totalDealSize=$(getTotalDealSize)
totalDeals=$(getTotalDeals)

printf '[%s] Writing stats \n' "$(date +%m-%d-%Y:%H:%M:%S)" >> "logs_$sdate/log.log"
writeStats "$numberOfUniqueClients" "$numberOfUniqueProviders" "$numberOfUniqueCIDs" "$totalDealSize" "$totalDeals" > "logs_$sdate/mongodb_stats.log"

printf '[%s] Writing status \n' "$(date +%m-%d-%Y:%H:%M:%S)" >> "logs_$sdate/log.log"
writeStatus > "logs_$sdate/mongodb_status.log"

printf 'Total execution time: %s \n' "$(($(date +%s) - sdate))s" >> "logs_$sdate/log.log"
