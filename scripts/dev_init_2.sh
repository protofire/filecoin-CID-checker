#!/usr/bin/env bash

./lotus wallet import ~/.genesis-sectors/pre-seal-t01000.key
./lotus-storage-miner init --genesis-miner --actor=t01000 --sector-size=2048 --pre-sealed-sectors=~/.genesis-sectors --pre-sealed-metadata=~/.genesis-sectors/pre-seal-t01000.json --nosync
./lotus-storage-miner run --nosync

