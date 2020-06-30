# Stage 1 - building app

FROM golang:1.14-alpine3.12 AS build

RUN apk add make

WORKDIR /src/

# download modules in separated layer, to speed up rebuild by utilising Docker layer caching system
COPY go.mod .
COPY go.sum .
# NOTE: build error may occur due to temporary unavailability of some packages sources
# Wait and build again is usually a good solution
RUN go mod download

COPY . /src/

RUN make build


# Stage 2 - serving app

FROM alpine:3.12

WORKDIR /app/

COPY --from=build /src/bin/cid-checker .
COPY --from=build /src/*.yaml /app/

EXPOSE 8080

ENTRYPOINT ["/app/cid-checker"]