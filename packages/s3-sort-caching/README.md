# Description

Script for s3 caching from mongodb.deals

Package is optional

## Dependencies

Script needs AWS S3 credentials (write to bucket)

## Usage

1. Fill .env file with aws creds( see [.env.example](./.env.example) ) - or use them for script

2.
```
yarn install

host@user:~/path$ node index.js -h

Synopsis

  $ node index.js --dest `filename.json`                                               
  $ node index.js --dest `filename.json` --where { "Proposal.VerifiedDeal": true }     
  $ node index.js --help                                                        

Options

  -h, --help              Display this usage guide.                                     
  -d, --dest string(required)       Destination path (path to file, to s3bucket etc).File should has .json extension                 
  -w, --where string(optional)      Where for mongodb search - correct json string, default: '{}'
```
