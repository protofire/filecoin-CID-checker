# Filecoin CID checker and Storage Oracle

![](https://github.com/protofire/filecoin-CID-checker/workflows/Build%20and%20test/badge.svg)
[![Go Report Card](https://goreportcard.com/badge/github.com/protofire/filecoin-CID-checker)](https://goreportcard.com/report/github.com/protofire/filecoin-CID-checker)

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

4. Effective and reliable Mongo DB database with indexes provides fast paginated search by Deal ID, File CID, Miner ID.

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
2. See the list of all file CIDs and related information:
- Deal ID
- Miner ID
- Sector number
- State
3. Search a record by a File CID, Deal ID, or Miner ID
4. Click on a chosen record and see other related details

**If you are running an own Filecoin (Lotus) node:**

Install the CID checker to your Filecoin (Lotus) node: see deployment instructions below

**If you are an application developer:**

Two API endpoints available to be used as a Storage Oracle (see the API section below) 



## Deployment

The simplest way to deploy the CID checker is doing it with docker-compose.

The CID checker is supposed to query the data from a running Lotus node.
To connect the CID checker to a Lutus node we need to specify the Lotus node's address as an  environment variable in the docker-compose.yaml:
- CID_LOTUS_RPCURL - URL available through the network and fully synced Lotus node.

Instructions on how to run Lotus node - https://lotu.sh/en+getting-started

Build backend and frontend containers with: 
```
make docker_build
make docker_build_frontend
```

Run docker-compose:
```
docker-compose -d up
```

## Application structure
 
Backend is a Golang application consist of two parts:
- API server - Gin framework & API handler
- Data harvester - group of lotus processors, each fetches data from Lotus node and store to MongoDB 


### API

Two API endpoints available:
#### :8080/deals
Get deals information about all deals from the database.
#### :8080/deals/:selector
Get deals by selector: File CID, Miner ID and Deal ID.

Both endpoints support pagination.

More detailed information on the API with examples can be found here:
https://documenter.getpostman.com/view/6638692/T17AiA6S?version=latest


### Lotus processors

BlockWatcher periodically checks the network for new blocks.
Every time a new block is added, the watcher runs processors. 

#### DealsProcessor

The Processor calls Lotus StateMarketDeals() method and saves all deals into the "deals" collection.

#### SectorsProcessor

The goal is to fetch sector information and discover the connection between deals and sectors.
Thr Processor calls StateMinerSectors() for each miner and saves it to "sectors" collection.    

#### MinersProcessor

The goal is to discover sector states.
The combination of StateGetActor() and ChainReadObj() is used to fetch miner information
form the miner.State struct.
The Miner state has two fields - Fault and Recovery - of type abi.BitField with sectors IDs.
Sectors in the "sectors" collection are modified based on these values.


### Database collections

* Deals - stores the deals information 
* Sectors - stores the sectors information

There is a data abstraction layer in /internals/repos intended for working with the collections.

### Configuration

Application could be configured by config.yaml file or by environment variables.

Lotus configuration:

* CID_LOTUS_RPCURL - URL of fully synced Lotus node

Database configuration:

* CID_DB_CONNECTIONSTRING - MongoDB connection string
* CID_DB_NAME - Database name

