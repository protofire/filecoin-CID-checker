const got = require('got');
const MongoClient = require('mongodb').MongoClient;

const DB_CONNECTIONSTRING = process.env.CID_DB_CONNECTIONSTRING || "mongodb://localhost:27017/";
const DB_NAME = process.env.CID_DB_NAME || "local_js_app";
const LOTUS_RPCURL = process.env.CID_LOTUS_RPCURL || 'http://3.9.46.104:1234/rpc/v0';
const DECODER_URL = process.env.CID_DECODER_URL || "http://localhost:8080/"

let dbo

MongoClient.connect(DB_CONNECTIONSTRING, function (err, db) {
    dbo = db.db(DB_NAME)
})

const requestChainHead = {
    "jsonrpc": "2.0",
    "method": "Filecoin.ChainHead",
    "id": 1,
    "params": []
}

const requestStateMarketDeals = {
    "jsonrpc": "2.0",
    "method": "Filecoin.StateMarketDeals",
    "id": 1,
    "params": [[]]
}

const requestStateMinerSectors = minerId => {
    return {
        "jsonrpc": "2.0",
        "method": "Filecoin.StateMinerSectors",
        "id": 1,
        "params": [minerId, null, null, null]
    }
}

const requestStateGetActor = minerId => {
    return {
        "jsonrpc": "2.0",
        "method": "Filecoin.StateGetActor",
        "id": 1,
        "params": [minerId, null]
    }
}

const requestChainReadObj = cid => {
    return {
        "jsonrpc": "2.0",
        "method": "Filecoin.ChainReadObj",
        "id": 1,
        "params": [{"/": cid}]
    }
}

const DealsProcessor = async () => {
    console.log("Fetching deals from Lotus node")

    const {body} = await got.post(LOTUS_RPCURL, {
        json: requestStateMarketDeals,
        responseType: 'json'
    })

    let writeOps = []

    Object.keys(body.result).forEach(function (key) {

        let deal = body.result[key];
        deal["DealID"] = parseInt(key)
        deal["Proposal"]["PieceCID"] = deal["Proposal"]["PieceCID"]["/"]

        writeOps.push({
            "replaceOne": {
                "filter": {"_id": parseInt(key)},
                "replacement": deal,
                "upsert": true
            }
        })

    })

    await dbo.collection("deals").bulkWrite(writeOps)
}

const SectorsProcessor = async () => {
    console.log("Fetching sectors from Lotus node")

    let minersList = await dbo.collection("deals").distinct("Proposal.Provider")

    let writeOps = []

    for (const minerId of minersList) {
        const {body} = await got.post(LOTUS_RPCURL, {
            json: requestStateMinerSectors(minerId),
            responseType: 'json'
        })

        if (body.result != null) {
            for (const sector of body.result) {

                sector.Info["Info"]["SealedCID"] = sector.Info["Info"]["SealedCID"]["/"]

                writeOps.push({
                    "updateOne": {
                        "filter": {"_id": sector.ID},
                        "update": {"$set": {"Info": sector.Info}},
                        "upsert": true
                    }
                })
            }
        }
    }

    await dbo.collection("sectors").bulkWrite(writeOps)
}

const updateBoolField = async (filter, field, value) => {
    let $set = {}
    $set[field] = value
    await dbo.collection("sectors").updateMany(filter, {"$set": $set})
}

const setSectors = async (sectors, field) => {
    if (sectors.length > 0) {
        await updateBoolField({"_id": {"$in": sectors}}, field, true)

        await updateBoolField({"_id": {"$nin": sectors}}, field, false)
    } else {
        await updateBoolField({}, field, false)
    }
}

const MinersProcessor = async () => {
    console.log("Fetching miners from Lotus node")

    let minersList = await dbo.collection("deals").distinct("Proposal.Provider")

    let allFaults = [], allRecoveries = []

    for (const minerId of minersList) {

        let response = await got.post(LOTUS_RPCURL, {
            json: requestStateGetActor(minerId),
            responseType: 'json'
        });

        let minerActorHead = response.body.result.Head['/']

        response = await got.post(LOTUS_RPCURL, {
            json: requestChainReadObj(minerActorHead),
            responseType: 'json'
        });

        // Sending data to decoder micro-service
        response = await got.post(DECODER_URL, {
            json: {state: response.body.result},
            responseType: 'json'
        })

        allFaults.push(...response.body.Faults)
        allRecoveries.push(...response.body.Recoveries)
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index
    }

    allFaults.sort((a, b) => a - b)
    allRecoveries.sort((a, b) => a - b)

    allFaults = allFaults.filter(onlyUnique)
    allRecoveries = allRecoveries.filter(onlyUnique)

    console.log("Fault sectors:", allFaults)
    console.log("Recovery sectors:", allRecoveries)

    await setSectors(allFaults, "Fault")
    await setSectors(allRecoveries, "Recovery")
}


let height = 0

loopHandler = async () => {
    const {body} = await got.post(LOTUS_RPCURL, {
        json: requestChainHead,
        responseType: 'json'
    })

    if (body.result.Height > height) {
        height = body.result.Height

        await DealsProcessor()
        await SectorsProcessor()
        await MinersProcessor()
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

(async () => {
    await sleep(1000)
    while (true) {
        try {
            await loopHandler()
        } catch (e) {
            console.log(e.toString())
        }
    }
})()
