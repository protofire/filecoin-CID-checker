package main

import (
	"context"
	"net/http"

	"github.com/protofire/filecoin-CID-checker/internals/api/handlers"
	"github.com/protofire/filecoin-CID-checker/internals/lotus_processors"

	"github.com/filecoin-project/lotus/api/client"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/toorop/gin-logrus"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Set client options
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")

	// Connect to MongoDB
	mongoClient, err := mongo.Connect(context.TODO(), clientOptions)

	if err != nil {
		log.WithError(err).Fatal("Failed to connect with MongoDB")
	}

	// Check the connection
	err = mongoClient.Ping(context.TODO(), nil)

	if err != nil {
		log.WithError(err).Fatal("Failed to connect with MongoDB")
	}

	log.Info("Connected to MongoDB!")

	lotusApi, closer, err := client.NewFullNodeRPC("ws://localhost:1234/rpc/v0", http.Header{})
	if err != nil {
		log.WithError(err).Fatal("Failed to connect with Lotus Node")
	}
	defer closer()

	head, err := lotusApi.ChainHead(context.Background())
	if err != nil {
		log.WithError(err).Fatal("Failed to connect with Lotus Node")
	}
	log.Infof("Connected to Lotus API, current chain height %d", head.Height())
	lotus_processors.NewBlocksWatcher(lotusApi).
		AddBlockEventHandler(lotus_processors.DealsProcessor(lotusApi, mongoClient)).
		AddBlockEventHandler(lotus_processors.SectorsProcessor(lotusApi, mongoClient)).
		AddBlockEventHandler(lotus_processors.MinersProcessor(lotusApi, mongoClient)).
		Start()

	router := gin.New()
	router.Use(ginlogrus.Logger(log.New()), gin.Recovery())

	router.GET("/deals/:deal-id", handlers.CreateDealHandler(mongoClient))
	router.GET("/deals", handlers.CreateDealsHandler(mongoClient))

	log.Fatal(router.Run(":8080"))
}
