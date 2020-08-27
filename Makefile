.PHONY: docker_build_frontend
docker_build_frontend:
	docker build -t cid-checker-frontend --build-arg REACT_APP_FILECOIN_CID_CHECKER_API=/api/ ./ui/

.PHONY: docker_build_js_watcher
docker_build_js_watcher:
	docker build -t cid-checker-js-watcher -f ./js-app/Dockerfile-watcher ./js-app/

.PHONY: docker_build_js_app
docker_build_js_app:
	docker build -t cid-checker-js -f ./js-app/Dockerfile-app ./js-app/

.PHONY: docker_build_all
docker_build_all: docker_build_frontend docker_build_js_watcher docker_build_js_app

.PHONY: up
up:	docker_build_all
	docker-compose up -d
