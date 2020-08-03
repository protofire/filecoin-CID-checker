# Filecoin CID checker and Storage Oracle

Initial RFP: "A website and API service that can list all CIDs along with their current status in the latest state tree. 
The page could also support queries by CID or miner. 
One option would be to build 1 long table that shows each miner x sectors they are storing x state as a colored indicator: green - good | grey - capacity | red - failing."

The benefits of the CID checker and Storage Oracle:

- for a User storing own files:
the CID checker is the only service that allows you to quickly check information about your file by its CID or the Deal ID. In addition, you can find information about other CIDs stored by a chosen Miner.

- for a Developer:
you can use this service as a Storage Oracle providing the extended range of data related to a chosen CID, a Deal, or a Miner from the latest state tree.

What it brings to you as a Developer in addition to the existing Lotus API:

1. A simple REST API service.
The CID Checker as a service provides two REST endpoints, where you need to specify a single search criteria to get the full CID summary (when the Lotus JSON RPC requires complicated JSON requests). 

2. It combines responses of several JSON RPC methods (StateMarketDeals, StateMinerSectors, StateGetActor, ChainReadObj) into a single convenient summary (database).

3. The back-end automates the process of fetching the new data, which requires thousands of JSON RCP calls for every loop.

4. Effective and reliable Mongo DB database with indexes provides fast paginated search by Deal ID, Piece CID, Miner ID.

5. UI provides rich details on deals.
For the end user it doesn't require any developer skills to quickly get information on deals. 

**Software requirements specification (the SRS) is** [here](https://hackmd.io/RMpGnE3YQm607jl0QevCoQ?view)

**Project Roadmap is** [here](https://github.com/protofire/filecoin-CID-checker#workspaces/filecoin-cid-checker-5ecbabcb812f8965b13d94cb/roadmap?repos=266746476)

**Project management board is** [here](https://github.com/protofire/filecoin-CID-checker#workspaces/filecoin-cid-checker-5ecbabcb812f8965b13d94cb/board?repos=266746476)


## Data mapping diagram
![DataMap_v2](https://user-images.githubusercontent.com/38105183/84385549-70260380-abf8-11ea-9f40-389c844b50a7.png)

## User Starting Guide 

If you are a total beginner to this, start here!

**Use remote CID checker service:**
1. Navigate to the website: [www.filecoin.tools](https://deploy-preview-20--filecoincidchecker.netlify.app/)
2. See the list of all piece CIDs and related information:
- Deal ID
- Miner ID
- Sector number
- Status
3. Search a record by a Piece CID, Deal ID, or Miner ID
4. Click on a chosen record and see other related details

**If you are running an own Filecoin (Lotus) node:**

Install the CID checker to your Filecoin (Lotus) node: see deployment instructions below

**If you are an application developer:**

Two API endpoints available to be used as a Storage Oracle (see the API section below) 



## Deployment

The simplest way to deploy the CID checker is doing it with docker-compose.

The CID checker is supposed to query the data from a running Lotus node.
To connect the CID checker to a Lutus node we need to specify the Lotus node's address as an  environment variable in the docker-compose-js.yaml:
- CID_LOTUS_RPCURL - URL available through the network and fully synced Lotus node.

Instructions on how to run Lotus node - https://lotu.sh/en+getting-started


Build docker images of JS Watcher, JS API, State Decoder and UI:

```
make build docker_build_js_watcher docker_build_js_app docker_build_state_decoder docker_build_frontend
```

Or use single command to build all images as once:

```
make docker_build_all
```

Run app with docker-compose:

```
docker-compose -f docker-compose.yaml up
```

### ENV variables

List of available environment variables for app configuration.

##### API app

| Name                    | Description               | Default value              |
| ----------------------- | ------------------------- | -------------------------- |
| CID_PORT                | API port                  | 3000                       |
| CID_DB_CONNECTIONSTRING | MongoDB connection string | mongodb://localhost:27017/ |
| CID_DB_NAME             | MongoDB database name     | local_js_app               |
 

##### Blockwatcher

| Name                    | Description                    | Default value                 |
| ----------------------- | ------------------------------ | ----------------------------- |
| CID_DB_CONNECTIONSTRING | MongoDB connection string      | mongodb://localhost:27017/    |
| CID_DB_NAME             | MongoDB database name          | local_js_app                  |
| CID_LOTUS_RPCURL        | HTTP address of Lotus node     | http://3.9.46.104:1234/rpc/v0 |
| CID_DECODER_URL         | State decoder microservice URL | http://localhost:8080/        |

 

## Docker images

Deployed application contains a number of docker images.

#### mongo

MongoDB database

#### cid-checker-frontend

Web UI

#### cid-checker-js

API app

#### cid-checker-js-watcher

Blockwatcher

#### state-decoder

State decoder microservice

#### caddy

Caddy webserver https://caddyserver.com/. Caddy configured with Caddyfile:

```
:80 {
  route /api/* {
    uri strip_prefix api
    reverse_proxy http://cid-checker-backend:8080
  }
  reverse_proxy http://cid-checker-frontend:5000
}
```

If you have a domain name, than replace :80 with domain name and Caddy will take care of SSL Certificates (through Let's Encrypt).

Example:

```
filecoin.tools {
  route /api/* {
    uri strip_prefix api
    reverse_proxy http://cid-checker-backend:8080
  }
  reverse_proxy http://cid-checker-frontend:5000
}
```

## App structure


### Block watcher

BlockWatcher periodically checks the network for new blocks.
Every time a new block is added, the watcher runs processors.

#### DealsProcessor

The Processor calls Lotus StateMarketDeals() method and saves all deals into the "deals" collection.

#### SectorsProcessor

The goal is to fetch sector information and discover the connection between deals and sectors.
Thr Processor calls StateMinerSectors() for each miner and saves it to "sectors" collection.

#### MinersProcessor

The goal is to discover sector states.
The combination of StateGetActor() and ChainReadObj() is used to fetch miner information. ChainReadObj() result is an encoded value, State decoder microservice called to decode miner state to JSON format.
The Miner state has two fields - Fault and Recovery - with sectors IDs.
Sectors in the "sectors" collection are modified based on these values.

![](https://i.imgur.com/LVddL4r.png)

### API

Two API endpoints available:
#### /deals
Get deals information about all deals from the database.
#### /deals/:selector
Get deals by selector: Piece CID, Miner ID and Deal ID.

Both endpoints support pagination.

More detailed information on the API with examples can be found here:
https://documenter.getpostman.com/view/6638692/T17AiA6S?version=latest

### State decoder

State decoder is a microservice for decoding miner state.
By default, blockwatcher send POST request to endpoint
http://state-decoder:8080/ and response is a miner state in JSON format.

Request example:
 
```json=
{
    "state": "j4hCAGRCAGT2WCYAJAgBEiCq+cXUe+GwFh0ntjmJQRwMFn9Dn8QJfJUKmQQeZqqFj4ADGwAAAAgAAAAAGQktQEoAUkD4wH1qzD1D2CpYJwABcaDkAiAv0p5icZMzvptPZUzCCh/ONrbazqNVBybjwWglXemegNgqWCcAAXGg5AIgGP5qzGGjo2sMNzxKOo6mS4Er8sqbUoBQkJx41AhVigzYKlgnAAFxoOQCIBMI9V08ggU6jRPa24gglRLdhT6w9y13rPSBuQT+ZrhDGgABxtJBANgqWCcAAXGg5AIgAc2Sf9zNeTj6ujI+MucMRFQbioP13JQdkIZlZe9a8UrYKlgnAAFxoOQCIOZtAOIPOViBL+Lo8dfaWx3FjQd6hhelAA94W+eO4jAuQQDYKlgnAAFxoOQCILa5pPOLto5SQSV1x5zV8cPChKMANLugfKOHvNuV3QRPQQBBDAE="
}
```

Response example:

```json=
{
    "State": {
        "Info": {
            "Owner": "t0100",
            "Worker": "t0100",
            "PendingWorkerKey": null,
            "PeerId": "ACQIARIgqvnF1HvhsBYdJ7Y5iUEcDBZ/Q5/ECXyVCpkEHmaqhY8=",
            "Multiaddrs": null,
            "SealProofType": 3,
            "SectorSize": 34359738368,
            "WindowPoStPartitionSectors": 2349
        },
        "PreCommitDeposits": "0",
        "LockedFunds": "1517314717501730078019",
        "VestingFunds": {
            "/": "bafy2bzaceax5fhtcogjthpu3j5suzqqkd7hdnnw2z2rvkbzg4pawqjk55gpia"
        },
        "PreCommittedSectors": {
            "/": "bafy2bzaceamp42wmmgr2g2ymg46euououzfyck7szknvfacqscohrvaikwfay"
        },
        "Sectors": {
            "/": "bafy2bzaceajqr5k5hsbakouncpnnxcbasujn3bj6wd3s255m6sa3sbh6m24eg"
        },
        "ProvingPeriodStart": 116434,
        "NewSectors": "AA==",
        "SectorExpirations": {
            "/": "bafy2bzaceaa43et73tgxsoh2xizd4mxhbrcfig4kqp25zfa5scdgkzppllyuu"
        },
        "Deadlines": {
            "/": "bafy2bzacedtg2ahcb44vrajp4lupdv62lmo4ldihpkdbpjiab54fxz4o4iyc4"
        },
        "Faults": "AA==",
        "FaultEpochs": {
            "/": "bafy2bzacec3ltjhtro3i4usbev24phgv6hb4fbfdaa2lxid4uod3zw4v3uce6"
        },
        "Recoveries": "AA==",
        "PostSubmissions": "DA==",
        "NextDeadlineToProcessFaults": 1
    },
    "Faults": [],
    "Recoveries": []
}
```