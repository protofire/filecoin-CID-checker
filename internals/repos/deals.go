package repos

import (
	"context"
	"fmt"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type DealsRepo interface {
	BulkWrite(deals []bsontypes.MarketDeal) error
	GetDeal(dealID uint64) (bsontypes.MarketDeal, error)
}

type MongoDealsRepo struct {
	mongoClient *mongo.Client
}

func NewMongoDealsRepo(mongoClient *mongo.Client) *MongoDealsRepo {
	return &MongoDealsRepo{mongoClient: mongoClient}
}

func (r *MongoDealsRepo) BulkWrite(deals []bsontypes.MarketDeal) error {
	var models []mongo.WriteModel

	for _, deal := range deals {
		filter := bson.M{"_id": deal.DealID}

		models = append(models, mongo.NewReplaceOneModel().
			SetFilter(filter).
			SetReplacement(deal).SetUpsert(true))
	}

	// TODO replace with config values
	collection := r.mongoClient.Database("local").Collection("deals")

	result, err := collection.BulkWrite(context.Background(), models)
	if err != nil {
		return fmt.Errorf("failed to write deals data: %w", err)
	}

	log.WithFields(log.Fields{
		"InsertedCount": result.InsertedCount,
		"MatchedCount":  result.MatchedCount,
		"ModifiedCount": result.ModifiedCount,
		"DeletedCount":  result.DeletedCount,
		"UpsertedCount": result.UpsertedCount,
	}).Info("Deals updated")

	log.Debugf("UpsertedIDs %v", result.UpsertedIDs)

	return nil
}

func (r *MongoDealsRepo) GetDeal(dealID uint64) (bsontypes.MarketDeal, error) {
	// TODO replace with config values
	dealsCollection := r.mongoClient.Database("local").Collection("deals")

	filter := bson.M{"_id": dealID}

	var deal bsontypes.MarketDeal
	if err := dealsCollection.FindOne(context.Background(), filter).Decode(&deal); err != nil {
		return bsontypes.MarketDeal{}, err
	}

	return deal, nil
}
