package test

import (
	"context"
	"testing"

	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Setup(t *testing.T) *mongo.Client {
	log.SetLevel(log.DebugLevel)

	// Set client options
	clientOptions := options.Client().ApplyURI("mongodb://localhost:28017")

	// Connect to MongoDB
	mongoClient, err := mongo.Connect(context.Background(), clientOptions)
	require.NoError(t, err, "failed to connect with test database")

	err = mongoClient.Database("local").Drop(context.Background())
	require.NoError(t, err, "failed to clear test database")

	return mongoClient
}
