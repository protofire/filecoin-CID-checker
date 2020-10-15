.PHONY: docker_build_frontend
docker_build_frontend:
	docker build -t cid-checker-frontend --build-arg REACT_APP_FILECOIN_CID_CHECKER_API=/api/ ./ui/

.PHONY: docker_build_watcher
docker_build_watcher:
	docker build -t cid-checker-watcher -f ./watcher/Dockerfile ./watcher/

.PHONY: docker_build_api
docker_build_api:
	docker build -t cid-checker-api -f ./api/Dockerfile ./api/

.PHONY: docker_build_all
docker_build_all: docker_build_frontend docker_build_watcher docker_build_api

.PHONY: up
up:	docker_build_all
	docker-compose up -d
