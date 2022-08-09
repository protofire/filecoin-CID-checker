#!/bin/bash
set -eou pipefail;

dbhost=localhost
dbport=27017
dbname=filecoindb
fcnode=https://calibration.node.glif.io/archive/lotus/rpc/v0

threads=8
step=1000

output=StateMarketDeals.json

height=$(curl -s -H "Content-Type:application/json"\
  --data '{ "jsonrpc":"2.0", "method":"Filecoin.ChainHead", "params":[], "id":1 }'\
  $fcnode\
  | jq '.result.Height')

curl -o $output -X POST\
  -H "Content-Type:application/json"\
  --data '{ "jsonrpc":"2.0", "method":"Filecoin.StateMarketDeals", "params":[[]], "id":1 }'\
  $fcnode

length=$(jq '.result | length' $output)
entries=$(jq '.result | to_entries' $output)

writeBatch () {
mongosh --quiet --host $dbhost --port $dbport --eval "
  db = db.getSiblingDB('$dbname');
  var deals = (${1}).map((el) => {
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

i=0
while ((i*step < length))
do
  for ((j=1;j<=threads;j++))
  do
    if ((i*step >= length))
    then
      continue;
    fi
    (( begin=step*i ))
    (( end=step*(i+1) ))
    echo "$begin"
    echo "$end"
    batch=$(jq --argjson b "$begin" --argjson e "$end" '.[$b:$e]' <<< "$entries");
    writeBatch "$batch" &
    i=$((i+1));
  done
  wait
done

numberOfUniqueClients=$(getNumberOfUniqueClients)
numberOfUniqueProviders=$(getNumberOfUniqueProviders)
numberOfUniqueCIDs=$(getNumberOfUniqueCIDs)
totalDealSize=$(getTotalDealSize)
totalDeals=$(getTotalDeals)

writeStats "$numberOfUniqueClients" "$numberOfUniqueProviders" "$numberOfUniqueCIDs" "$totalDealSize" "$totalDeals"
writeStatus
