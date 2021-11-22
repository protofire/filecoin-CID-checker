#!/bin/bash

echo "----------------------------------------------------"
echo "--- Init script for CID Checker (filecoin.tools) ---"
echo "----------------------------------------------------"

echo ""
echo "-------------------------------------"
echo "--- Pull last updates from GitHub ---"
echo "-------------------------------------"
echo ""

cd /home/ubuntu/CID-Checker-filecoin-tools/filecoin-CID-checker

git pull

echo "-------------------------------------------------------"
echo "--- Build Docker images: frontend, backend, watcher ---"
echo "-------------------------------------------------------"

docker build -t cid-checker-frontend:$(cat /home/ubuntu/CID-Checker-filecoin-tools/filecoin-CID-checker/packages/frontend/version.txt) -f Dockerfile.frontend .
docker build -t cid-checker-backend:$(cat /home/ubuntu/CID-Checker-filecoin-tools/filecoin-CID-checker/packages/frontend/version.txt) -f Dockerfile.backend .
docker build -t cid-checker-watcher:$(cat /home/ubuntu/CID-Checker-filecoin-tools/filecoin-CID-checker/packages/frontend/version.txt) -f Dockerfile.watcher .

echo "-----------------------------"
echo "------ Build completed! -----"
echo "-----------------------------"
echo "--- Docker Compose me up! ---"
echo "-----------------------------"

docker-compose down && docker-compose up -d

echo "----------------------"
echo "--- Cleanup Docker ---"
echo "----------------------"

docker system prune -f

echo ""
echo "--------------------"
echo "All steps completed!"
echo "--------------------"
echo ""