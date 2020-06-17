# Filecoin CID checker and Storage Oracle

![](https://github.com/protofire/filecoin-CID-checker/workflows/Build%20and%20test/badge.svg)
[![Go Report Card](https://goreportcard.com/badge/github.com/protofire/filecoin-CID-checker)](https://goreportcard.com/report/github.com/nektos/act)

A website and API service that can list all CIDs along with their current status in the latest state tree. 
The page could also support queries by CID or miner. 
One option would be to build 1 long table that shows each miner x sectors they are storing x state as a colored indicator: green - good | grey - capacity | red - failing.

**Software requirements specification (the SRS) is** [here](https://hackmd.io/RMpGnE3YQm607jl0QevCoQ?view)

**Project Roadmap is** [here](https://github.com/protofire/filecoin-CID-checker#workspaces/filecoin-cid-checker-5ecbabcb812f8965b13d94cb/roadmap?repos=266746476)

**Project management board is** [here](https://github.com/protofire/filecoin-CID-checker#workspaces/filecoin-cid-checker-5ecbabcb812f8965b13d94cb/board?repos=266746476)

## Data mapping diagram
![DataMap_v2](https://user-images.githubusercontent.com/38105183/84385549-70260380-abf8-11ea-9f40-389c844b50a7.png)

## User Starting Guide 

If you are a total beginner to this, start here!

- Use remote CID checker service:
1. Navigate to the vebsite: www.TBD
2. Enter your Filecoin address 
3. See the list of your CIDs and their currens status
4. Query info by any specific CID or miner 

- Install the CID checker to your Filecoin (Lotus) node:
*instructions are in progress*
