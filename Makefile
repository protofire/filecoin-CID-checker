.PHONY: test
test:
	go test -v ./...

.PHONY: fmt
fmt:
	go fmt ./...
