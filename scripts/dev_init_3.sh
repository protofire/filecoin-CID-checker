#!/usr/bin/env bash

#./lotus wallet list
./lotus wallet set-default $(./lotus wallet list)

cid1=$(./lotus client import ./1.txt)
#./lotus client import ./2.txt
#./lotus client import ./3.txt
#./lotus client import ./4.txt
#./lotus client import ./5.txt
#./lotus client import ./testfile.txt

#bafkreiewfgmb4y2mx2s6hphxe3tghfemnbuoziwa2wm2dy765dmx7ceq6i
#bafkreibwalsf5kyvj4gzvrvdaaxyw4e3d7o7y6l6fscie3ugtizoowlidu
#bafkreigm3cg5ecxceh3lwxkolcl53es7xgxnhkslrdvouzh2uyxbajxp3i

./lotus client query-ask t01000
./lotus client list-deals

./lotus client deal "$cid1" t01000 0.0000000005 1000
./lotus client deal "$cid1" t01000 0.0000000005 10000
./lotus client deal "$cid1" t01000 0.0000000005 100000
./lotus client deal "$cid1" t01000 0.0000000005 1000000

#./lotus client deal bafkreibwalsf5kyvj4gzvrvdaaxyw4e3d7o7y6l6fscie3ugtizoowlidu t01000 0.0000000005 10000
#./lotus client deal bafkreigm3cg5ecxceh3lwxkolcl53es7xgxnhkslrdvouzh2uyxbajxp3i t01000 0.0000000005 10000

#bafyreihiftuk5z4i4bghukhau7ymifosr6cu32v32mp5zuzqxfozq2ysu4

./lotus client list-deals