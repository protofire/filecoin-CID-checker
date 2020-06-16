.PHONY: build
build:
	go build -o bin/cid-checker ./cmd/cid-checker/main.go

.PHONY: test
test:
	go test -v ./...

.PHONY: fmt
fmt:
	go fmt ./...
