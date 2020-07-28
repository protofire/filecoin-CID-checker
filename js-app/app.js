const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())

const port = 3000


const MongoClient = require('mongodb').MongoClient;
// TODO env
const url = "mongodb://localhost:27017/";

let dbo

MongoClient.connect(url, function (err, db) {
    dbo = db.db("local");
})

function isNormalInteger(str) {
    const n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
}

const handler = async (req, res) => {
    const selector = req.params.selector;

    const perPage = isNormalInteger(req.query.per_page) ? parseInt(req.query.per_page) : 10
    const page = isNormalInteger(req.query.page) ? parseInt(req.query.page) : 1
    const skip = perPage * (page - 1)

    let query = {};
    if (selector) {
        if (isNormalInteger(selector)) {
            const dealID = parseInt(selector)
            query = {"_id": dealID}
        } else {
            query = {"$or": [{"proposal.piececid": selector}, {"proposal.provider": selector}]}
        }
    }

    let deals = await dbo.collection("deals").find(query).limit(perPage).skip(skip).sort({"_id": -1}).toArray()

    deals = await Promise.all(deals.map(async deal => {

        const dealID = deal.dealid
        const sector = await dbo.collection("sectors").findOne({"info.info.dealids": dealID})

        let Status = "";
        let sectorID = "";

        if (sector) {
            if (sector.Recovery) {
                Status = "Recovery"
            } else if (sector.Fault) {
                Status = "Fault"
            } else {
                Status = "Active"
            }

            sectorID = sector.ID
        }

        return {
            "DealInfo": deal,
            "DealID": dealID,
            "SectorID": sectorID,
            "SectorInfo": sector,
            "Status": Status
        }
    }))

    const response = {
        "Pagination": {
            "Page": page,
            "PerPage": perPage
        },
        "Deals": deals
    }

    res.send(response);
}

app.get('/deals', handler)
app.get('/deals/:selector', handler)

app.listen(port, () => console.log(`CID checker app listening at http://localhost:${port}`))
