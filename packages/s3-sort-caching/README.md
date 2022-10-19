# Description

Script for s3 caching from mongodb.deals

Package is optional

## Usage

```
yarn install

host@user:~/path$ node index.js -h

Synopsis

  $ node index.js --mongouri `mongodb://localhost:27017` --dbname `dbname` --dest `s3bucket/filename.json`                                               
  $ node index.js --mongouri `mongodb://localhost:27017` --dbname `dbname`  --dest `s3bucket/filename.json` --where { "Proposal.VerifiedDeal": true }     
  $ node index.js --help                                                        

Options

  -h, --help              Display this usage guide.                                     
  -m, --mongouri string   Mongodb connection URI                                        
  -n, --dbname string     Mongodb name                                                  
  -d, --dest string       Destination path (path to file, to s3bucket etc).File should has .json extension                 
  -w, --where string      Where for mongodb search - correct json string, default: '{}'
```



