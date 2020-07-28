const cbor = require('cbor');
const got = require('got');

const MongoClient = require('mongodb').MongoClient;
// TODO env
const url = "mongodb://localhost:27017/";

let dbo

MongoClient.connect(url, function (err, db) {
    dbo = db.db("local");
})

const rpcUrl = 'http://3.9.46.104:1234/rpc/v0';

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

    const {body} = await got.post(rpcUrl, {
        json: requestStateMarketDeals,
        responseType: 'json'
    });

    let writeOps = []

    Object.keys(body.result).forEach(function (key) {

        writeOps.push({
            "replaceOne": {
                "filter": {"_id": key},
                "replacement": body.result[key],
                "upsert": true
            }
        });

    });

    await dbo.collection("deals").bulkWrite(writeOps)
}

const SectorsProcessor = async () => {
    console.log("Fetching sectors from Lotus node")

    let minersList = await dbo.collection("deals1").distinct("Proposal.Provider")

    let writeOps = []

    for (const minerId of minersList) {
        const {body} = await got.post(rpcUrl, {
            json: requestStateMinerSectors(minerId),
            responseType: 'json'
        });

        if (body.result != null) {
            for (const sector of body.result) {
                writeOps.push({
                    "updateOne": {
                        "filter": {"_id": sector.ID},
                        "update": {"$set": {"Info": sector.Info}},
                        "upsert": true
                    }
                });
            }
        }
    }

    await dbo.collection("sectors").bulkWrite(writeOps)
}

const MinersProcessor = async () => {
    console.log("Fetching miners from Lotus node")

    let minersList = await dbo.collection("deals").distinct("Proposal.Provider")

    for (const minerId of minersList) {
        let response = await got.post(rpcUrl, {
            json: requestStateGetActor(minerId),
            responseType: 'json'
        });

        let minerActorHead = response.body.result.Head['/']

        response = await got.post(rpcUrl, {
            json: requestChainReadObj(minerActorHead),
            responseType: 'json'
        });

        // TODO: UnmarshalCBOR response.body.result (minerStateBytes)
        console.log(response.body.result)

        // TODO: collect faults and recoveries
    }

    // TODO: save faults and recoveries
}


let height = 0;

loopHandler = async () => {
    const {body} = await got.post(rpcUrl, {
        json: requestChainHead,
        responseType: 'json'
    });

    if (body.result.Height > height) {
        height = body.result.Height;

        await DealsProcessor()
        await SectorsProcessor()
        await MinersProcessor()
    }

}

(async () => {
    while (true) {
        await loopHandler()
    }
})();
