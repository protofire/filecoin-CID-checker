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
As a User I want to see 1 long table listing my CIDs and:
1. miners storing this CID
2. sectors they are storing
3. state as a colored indicator:
green - good | grey - capacity | red - failing

```gherkin=
Feature: list the User's CIDs and related info
  
# indexing the Filecoin state by the User's account number in the Filecoin network
Scenario: Retrieve the CIDs info related to the User's account
    When The User enters his/her Filecoin account number into the Search window
    Then The APP lists the User's files CIDs,
	  their status in the latest state tree
    
```
>
```gherkin=
Feature: search info by the file CID 

  # indexing the Filecoin state by the CID
  Scenario: Query the info related to file CID
    When User enters the file CID into the Search window
    Then the APP lists the miners storing this CID,
	  sectors they are storing,
	  and the state as a colored indicator
```
>
```gherkin=
Feature: search info by the miner 

  # indexing the Filecoin state by the miner's account number
  Scenario: Query the info related to the miner
    When the User enters the miner account into the Serach window
    Then the APP lists the User's CIDs stored by the miner,
	and the state as a colored indicator
```

> 

User flows
---
```sequence
User->APP: 1.User acc number
Note right of APP: indexing the latest state
APP-->User: List of CIDs
User->APP: 2.File CID

Note right of APP: indexing the latest state by the CID
APP-->User: List of miners storing this CID
User->APP: 3.Miner acc number
Note right of APP: indexing the latest state by the miner acc
APP-->User: List of User's CID stored by the miner

```

> 

UI wireframes (in progress)
---
TBD
```
