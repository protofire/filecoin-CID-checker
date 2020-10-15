# Filecoin CID checker and Storage Oracle

- [Introduction](#Introduction)
- [User Starting Guide](#User-starting-guide)
- [Deployment](#Deployment)
- [Docker Images](#Docker-images)
- [App structure](#App-structure)

## Introduction

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


## User starting guide

If you are a total beginner to this, start here!

**Use remote CID checker service:**
1. Navigate to the website: [www.filecoin.tools](https://deploy-preview-20--filecoincidchecker.netlify.app/)
2. See the list of all piece CIDs and related information:
- Pieced CID
- Status
- Deal ID
- Payload CID
3. Search a record by a Piece CID, Deal ID, or Miner ID or Payload CID
4. Click on a chosen record and see other related details

**If you are running an own Filecoin (Lotus) node:**

Install the CID checker to your Filecoin (Lotus) node: see deployment instructions below

**If you are an application developer:**

Two API endpoints available to be used as a Storage Oracle (see the API section below) 


## Deployment

The simplest way to deploy the CID checker is doing it with docker-compose.

The CID checker is supposed to query the data from a running Lotus node.
To connect the CID checker to a Lotus node specify the Lotus node's address as an environment variable and the corresponding JWT token in the docker-compose-js.yaml:
- CID_LOTUS_RPCURL - URL available through the network and fully synced Lotus node.
- CID_LOTUS_JWT_TOKEN - JWT token with at least read permissions

Instructions on how to run Lotus node - https://docs.filecoin.io/get-started/lotus/installation/


Build all docker images of the different components (the `Makefile` files has the comands to build the images individually):

```
make docker_build_all
```

Run app with docker-compose:

```
docker-compose -f docker-compose.yaml up
```

### ENV variables

List of available environment variables for app configuration.

##### API component

| Name                    | Description               | Default value              |
| ----------------------- | ------------------------- | -------------------------- |
| PORT                    | API port                  | 3000                       |
| CID_DB_CONNECTIONSTRING | MongoDB connection string | mongodb://localhost:27017/ |
| CID_DB_NAME             | MongoDB database name     | cid_checker_watcher        |
 

##### Watcher component

| Name                    | Description                    | Default value                 |
| ----------------------- | ------------------------------ | ----------------------------- |
| CID_DB_CONNECTIONSTRING | MongoDB connection string      | mongodb://localhost:27017/    |
| CID_DB_NAME             | MongoDB database name          | cid_checker_watcher           |
| CID_LOTUS_RPCURL        | HTTP address of Lotus node     | http://3.9.46.104:1234/rpc/v0 |
| CID_LOTUS_JWT_TOKEN     | JWT token required in requests | ''                            |
| SLEEP_TIPSET_CHECK_MS   | Time between processing loops  | 25000 (milliseconds)          |

 

## Docker images

Deployed application contains a number of docker images.

#### mongo

MongoDB database

#### cid-checker-watcher

Runs the loops that retrieves Deals' data from the Lotus node and feeds the Mongo DB.

#### cid-checker-api

API that queries and searches through the DB to serve the UI

#### cid-checker-frontend

Web UI created via [create-react-app](https://reactjs.org/docs/create-a-new-react-app.html)

#### caddy

Caddy webserver https://caddyserver.com/ to serve the UI's. Caddy configured with Caddyfile:

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

The main components of the CID checker are:

### Watcher

Periodically checks the network for new chain height. Every time a new height is detected, the watcher runs the _processors_ (originally, more than one). Currently the only processor that runs ins the `DealsProcessor` that calls Lotus StateMarketDeals() method and saves all deals into the "deals" collection.

The watcher component is coded using typescript and details about how to run it indivitually can be found in `/watcher/package.json`

### API

Two API endpoints available:

* `/deals`
  
  get deals information about all deals from the database.

* `/deals/:selector`
  
  get deals by selector: Piece CID, Miner ID, Deal ID and Payload CID.

Both endpoints support pagination.

The api component is coded using typescript and details about how to run it indivitually can be found in `/api/package.json`

### Frontend

create-react-app based application that queries the API. More details about how to run it and the environmental variables can be found in `/ui`.