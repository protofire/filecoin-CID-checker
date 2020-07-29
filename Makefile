.PHONY: build
build:
	go build -o bin/cid-checker ./cmd/cid-checker/main.go

.PHONY: test
test:
	docker-compose -f ./test/docker-compose.yaml up -d
	go test -v -coverprofile cp.out ./...

.PHONY: fmt
fmt:
	go fmt ./...

.PHONY: lint
lint:
	golint ./...

.PHONY: docker_build
docker_build:
	docker build -t cid-checker .

.PHONY: docker_build_frontend
docker_build_frontend:
	docker build -t cid-checker-frontend --build-arg REACT_APP_FILECOIN_CID_CHECKER_API=/api/ ./ui/

.PHONY: docker_build_state_decoder
docker_build_state_decoder:
	docker build -t state-decoder ./state-decoder/

.PHONY: docker_build_js_watcher
docker_build_js_watcher:
	docker build -t cid-checker-js-watcher -f ./js-app/Dockerfile-watcher  ./js-app/

.PHONY: docker_build_js_app
docker_build_js_app:
	docker build -t cid-checker-js -f ./js-app/Dockerfile-app ./js-app/

.PHONY: docker_build_all
docker_build_all: docker_build docker_build_frontend docker_build_state_decoder docker_build_js_watcher docker_build_js_app

.PHONY: up
up:	docker_build docker_build_frontend
	docker-compose -d up
