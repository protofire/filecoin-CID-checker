---
title: 'SRS.md'
disqus: hackmd
---

Filecoin CID checker SRS
===
Link: https://hackmd.io/RMpGnE3YQm607jl0QevCoQ?view
## Table of Contents

[TOC]

User story
---
As a User I want to see 1 long table listing all the CIDs and:
1. miners storing this CID
2. sectors they are storing
3. state as a colored indicator:
green - good | grey - capacity | red - failing

Core features
```gherkin=
Feature: list all the CIDs and related info
  
# indexing the latest Filecoin state
Scenario: Retrieve the info related to all CIDs
    When The User navigates to the URL of the CID checker
    Then The APP lists all the CIDs,
	  and their status in the latest state tree
    
```
>
```gherkin=
Feature: search info by the piece CID 

  # indexing the Filecoin state by the CID
  Scenario: Query the info related to piece CID
    When User enters the piece CID into the Search window
    Then the APP lists the Miners storing this CID,
	  sectors they are storing,
	  and the state as a colored indicator
```
>
```gherkin=
Feature: search info by the Miner 

  # indexing the Filecoin state by the Miner_ID
  Scenario: Query the info related to the Miner
    When the User enters the Miner_ID into the Serach window
    Then the APP lists the User's CIDs stored by the Miner,
	and the state as a colored indicator
```
Secondary feature (not in the MVP scope):
> 
```gherkin=
Feature: list a particular User's CIDs and related info
  
# indexing the Filecoin state by the User's PubKey in the Filecoin network
Scenario: Retrieve the CIDs info related to the User's PubKey
    When The User enters his/her PubKey into the Search window
    Then The APP lists the User's files CIDs,
	  their status in the latest state tree
    
```

User flows
---
```sequence
User->APP: 1.URL
Note right of APP: Navigating to the URL
APP-->User: List of CIDs

User->APP: 2.Piece CID
Note right of APP: indexing the latest state by the CID
APP-->User: List of Miners storing this file

User->APP: 3.Miner_ID
Note right of APP: indexing the latest state by the Miner_ID
APP-->User: List of User's CID stored by the Miner

```
> 

API service
---
**Core methods:**
* Method 1: indexing the latest state by the CID
  *  Input: CID
  *  Return: Miner ID | Sector ID | State

- Method 2: indexing the latest state by the Storage Miner ID
  *  Input: Miner ID
  *  Return: CID | Sector ID | State 

**Extended:**
* The Database storing the metadata of the *Proposal* 
* API calls for:
	* PieceCID
	* PieceSize
	* VerifiedDeal
	* Client
	* Provider
	* StartEpoch
	* EndEpoch
	* StoragePricePerEpoch
	* ProviderCollateral
	* ClientCollateral 

UI wireframes
---

version 2
![](https://i.imgur.com/cZqJiFt.jpg)

Extension: 
* Expandable part with Additional columns:
  * Start of the storage deal
  * End of the storage deal
  * Verified deal indication
  * PieceSize
  * Client
  * Provider
  * StoragePricePerEpoch
  * ProviderCollateral
  * ClientCollateral
