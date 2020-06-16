#!/usr/bin/env bash

rm -rf ~/.lotus ~/.lotusstorage ~/.genesis-sectors

./lotus-seed pre-seal --sector-size 2048 --num-sectors 10
./lotus-seed genesis new lotusgen.json
./lotus-seed genesis add-miner lotusgen.json ~/.genesis-sectors/pre-seal-t01000.json

./lotus daemon --lotus-make-genesis=dev.gen --genesis-template=lotusgen.json --bootstrap=false
