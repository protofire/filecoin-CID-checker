const express = require('express')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;

const PORT = process.env.CID_PORT || 3000;
const DB_CONNECTIONSTRING = process.env.CID_DB_CONNECTIONSTRING || "mongodb://localhost:27017/";
const DB_NAME = process.env.CID_DB_NAME || "local_js_app";

let dbo

MongoClient.connect(DB_CONNECTIONSTRING, function (err, db) {
    dbo = db.db(DB_NAME)
})

function isNormalInteger(str) {
    const n = Math.floor(Number(str))
    return n !== Infinity && String(n) === str && n >= 0
}

const handler = async (req, res) => {
    const selector = req.params.selector

    const perPage = isNormalInteger(req.query.per_page) ? parseInt(req.query.per_page) : 10
    const page = isNormalInteger(req.query.page) ? parseInt(req.query.page) : 1
    const skip = perPage * (page - 1)

    let query = {};
    if (selector) {
        if (isNormalInteger(selector)) {
            const dealID = parseInt(selector)
            query = {"_id": dealID}
        } else {
            query = {"$or": [{"Proposal.PieceCID": selector}, {"Proposal.Provider": selector}]}
        }
    }

    let deals = await dbo.collection("deals").find(query).limit(perPage).skip(skip).sort({"_id": -1}).toArray()

    deals = await Promise.all(deals.map(async deal => {

        const dealID = deal["_id"]
        const sector = await dbo.collection("sectors").findOne({"Info.Info.DealIDs": dealID})

        let State = ""
        let sectorID = 0

        if (sector) {
            if (sector.Recovery) {
                State = "Recovery"
            } else if (sector.Fault) {
                State = "Fault"
            } else {
                State = "Active"
            }

            sectorID = parseInt(sector["_id"])
        }

        return {
            "DealInfo": deal,
            "DealID": dealID,
            "SectorID": sectorID,
            "SectorInfo": sector,
            "State": State
        }
    }))

    const response = {
        "Pagination": {
            "Page": page,
            "PerPage": perPage
        },
        "Deals": deals
    }

    res.send(response)
}

const app = express()
app.use(cors())

app.get('/deals', handler)
app.get('/deals/:selector', handler)

app.listen(PORT, () => console.log(`CID checker app listening at http://localhost:${PORT}`))
