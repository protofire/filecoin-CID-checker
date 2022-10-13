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
1. Navigate to the website: [https://filecoin.tools](https://filecoin.tools)
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


Build all docker images of the different components (the `package.json` files has the comands to build the images individually):

```
yarn run dc:build
```

Run app with docker-compose:

```
docker-compose -f docker-compose.yaml up
# or
yarn start:dev
```

### ENV variables

List of available environment variables for app configuration.

##### API component

See [packages/backend/.env-example](packages/backend/.env-example) 

##### Watcher component

See [packages/watcher/.env-example](packages/watcher/.env-example)

##### Frontend component 

See [packages/frontend/.env-example](packages/frontend/.env-example)

## Docker images

Deployed application contains a number of docker images.

#### cid-checker-watcher

Runs the loops that retrieves Deals' data from the Lotus node and feeds the Mongo DB.

#### cid-checker-backend

API that queries and searches through the DB to serve the UI

#### cid-checker-frontend

Web UI created via [create-react-app](https://reactjs.org/docs/create-a-new-react-app.html) and typescript; image used build files via Nginx (see `./.config/nginx.conf`).

### How to run

1. Prepare `.env` file in root directory

2. Build images:

```bash
docker build -t cid-checker-frontend:$(cat ./packages/frontend/version.txt) -f Dockerfile.frontend . && \
docker build -t cid-checker-backend:$(cat ./packages/frontend/version.txt) -f Dockerfile.backend . && \
docker build -t cid-checker-watcher:$(cat ./packages/frontend/version.txt) -f Dockerfile.watcher .
```
3. Run docker compose:

```bash
docker-compose up -d
```

## App structure

The main components of the CID checker are:

### Watcher (packages/watcher, typescript)

Periodically checks the network for new chain height. 
Every time a new height is detected, the watcher runs the _processors_ (originally, more than one). 
Currently the only processor that runs ins the `DealsProcessor` that calls Lotus StateMarketDeals() method and saves all deals into the "deals" collection.

### API (packages/backend, nodejs)

Used in frontend for remote REST calls
Has openapi interactive UI to make calls ( route /docs )

### Frontend (packages/frontend typescript)

create-react-app based application that queries the API

## Run app components

### With docker-compose

#### Dependencies

1. docker-compose [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
2. yarn - [https://yarnpkg.com/](https://yarnpkg.com/)
 
#### Process

1. Got to package root dir
2. Fill .env file - as an example - .env-example in packages/backend, packages/frontend, packages/wqtcher 
3. Build containers(once, after each changes in code)

```
yarn dc:build # all

# or as separated
yarn run dc:build:api
yarn run dc:build:ui
yarn run dc:build:watcher

```

4. Run

```
    yarn install
    yarn start # will run all app components, app will be available on url http://localhost
    # or separated
    yarn run start:mongo:dc
    yarn run start:api:dc
    yarn run start:ui:dc
    yarn run start:watcher:dc
        
    yarn stop # stop all containers
    # or separated
    yarn run stop:mongo:dc
    yarn run stop:caddy:dc
    yarn run stop:api:dc
    yarn run stop:ui:dc
    yarn run stop:watcher:dc
    
```

#### Dependencies

1. yarn - [https://yarnpkg.com/](https://yarnpkg.com/)

#### Process

1. install dependencies
```
yarn install
```
2. run services in different terminals

```
yarn run start:ui
yarn run start:api
yarn run start:watcher
```

## CI/CD

The image uses as part of the solution for the cid-checker collects data from the endpoint and provides it to the external DB.

### CI Logic
CI verifies that the Dockerfile can build successfully.

### CD Logic
CD has mandatory requirements to bump a new image version in the buildspec.yaml file.

CD push image to DockerHub repository, and it is publicly available.

URL for DockerHub repository: [https://hub.docker.com/r/protofire/cid-checker](https://hub.docker.com/r/protofire/cid-checker)
