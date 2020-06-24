package repos

import (
	"context"
	"fmt"
	"strings"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type DealsRepo interface {
	BulkWrite(deals []*bsontypes.MarketDeal) error
	GetDeal(dealID uint64) (*bsontypes.MarketDeal, error)
	Find(filter bson.M) ([]*bsontypes.MarketDeal, error)
	Miners() ([]string, error)
	CreateIndexes() error
}

const dealsCollectionName = "deals"

type MongoDealsRepo struct {
	collection *mongo.Collection
}

func NewMongoDealsRepo(mongoClient *mongo.Client, dbName string) *MongoDealsRepo {
	return &MongoDealsRepo{
		collection: mongoClient.Database(dbName).Collection(dealsCollectionName),
	}
}

func (r *MongoDealsRepo) BulkWrite(deals []*bsontypes.MarketDeal) error {
	var models []mongo.WriteModel

	for _, deal := range deals {
		filter := bson.M{"_id": deal.DealID}

		models = append(models, mongo.NewReplaceOneModel().
			SetFilter(filter).
			SetReplacement(deal).SetUpsert(true))
	}

	result, err := r.collection.BulkWrite(context.Background(), models)
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

func (r *MongoDealsRepo) GetDeal(dealID uint64) (*bsontypes.MarketDeal, error) {
	filter := bson.M{"_id": dealID}

	var deal bsontypes.MarketDeal
	if err := r.collection.FindOne(context.Background(), filter).Decode(&deal); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &deal, nil
}

func (r *MongoDealsRepo) Find(filter bson.M) ([]*bsontypes.MarketDeal, error) {
	cursor, err := r.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}

	var deals []*bsontypes.MarketDeal
	if err := cursor.All(context.Background(), &deals); err != nil {
		return nil, err
	}

	return deals, nil
}

func (r *MongoDealsRepo) Miners() ([]string, error) {
	minersList, err := r.collection.Distinct(context.Background(), "proposal.provider", bson.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to select distinct miners ids from deals %w", err)
	}

	var minerIDs []string
	for _, miner := range minersList {
		minerID, ok := miner.(string)
		if !ok {
			return nil, fmt.Errorf("minerID %v is not a string", minerID)
		}
		minerIDs = append(minerIDs, minerID)
	}
	return minerIDs, nil
}

func (r *MongoDealsRepo) CreateIndexes() error {
	models := []mongo.IndexModel{
		{Keys: bson.M{"proposal.piececid": 1}},
		{Keys: bson.M{"proposal.provider": 1}},
	}

	newIndexes, err := r.collection.Indexes().CreateMany(context.Background(), models)
	if err != nil {
		return err
	}

	log.Infof(`Collection "%s" indexes created: %s`, dealsCollectionName, strings.Join(newIndexes, ", "))

	return nil
}
