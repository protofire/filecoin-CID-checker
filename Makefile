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
	docker build -t cid-checker-frontend  --build-arg REACT_APP_FILECOIN_CID_CHECKER_API=/api/ ./ui/
