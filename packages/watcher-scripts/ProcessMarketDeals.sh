#!/bin/bash
# Prerequisites:
# node v14, v16
# npm i mongodb [https://www.npmjs.com/package/mongodb] (^v4.9.1)
set -eou pipefail;

sdate="$(date +%s)"

fcnode=https://calibration.node.glif.io/archive/lotus/rpc/v0
filePath=StateMarketDeals.json

# Example: mongodb://login:pass@localhost:27017
mongoURL=mongodb://localhost:27017
dbName=filecoindb

printf '[%s] Started processing state market deals\n' "$(date +%d-%m-%Y:%H:%M:%S)"
currentHeight=$(curl -s -H "Content-Type:application/json"\
  --data '{ "jsonrpc":"2.0", "method":"Filecoin.ChainHead", "params":[], "id":1 }'\
  $fcnode\
  | jq '.result.Height')
printf '[%s] Current height: %s \n' "$(date +%d-%m-%Y:%H:%M:%S)" "$currentHeight"

printf '[%s] Fetching deals \n' "$(date +%d-%m-%Y:%H:%M:%S)"
curl -o $filePath -X POST\
  -H "Content-Type:application/json"\
  --data '{ "jsonrpc":"2.0", "method":"Filecoin.StateMarketDeals", "params":[[]], "id":1 }'\
  $fcnode

printf '[%s] Processing deals \n' "$(date +%d-%m-%Y:%H:%M:%S)"
totalDealsUpdated=$(node processMarketDeals.js "$mongoURL" "$dbName" "$currentHeight" "$filePath")
printf '[%s] Total deals updated: %s \n' "$(date +%d-%m-%Y:%H:%M:%S)" "$totalDealsUpdated"
printf '[%s] Total execution time: %s \n' "$(date +%d-%m-%Y:%H:%M:%S)" "$(($(date +%s) - sdate))s"
