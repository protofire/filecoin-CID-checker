.PHONY: build
build:
	go build -o bin/cid-checker ./cmd/cid-checker/main.go

.PHONY: test
test:
	docker-compose -f ./test/docker-compose.yaml up -d
	go test -v ./...

.PHONY: fmt
fmt:
	go fmt ./...
