package lotusprocs

import (
	"context"
	"fmt"
	"strconv"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"

	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// DealsProcessor read deals from lotus, trough lotusAPI and save to "deals" mongo collection.
func DealsProcessor(lotusAPI api.FullNode, mongoClient *mongo.Client) BlockEventHandler {
	return func() error {
		log.Info("Fetching deals from Lotus node")

		ctx := context.Background()
		deals, err := lotusAPI.StateMarketDeals(ctx, types.EmptyTSK)
		if err != nil {
			log.WithError(err).Error("Failed to execute StateMarketDeals")
		}

		collection := mongoClient.Database("local").Collection("deals")

		var models []mongo.WriteModel
		for sDealID, deal := range deals {
			dealID, err := strconv.ParseUint(sDealID, 10, 64)
			if err != nil {
				return err
			}

			filter := bson.M{"_id": dealID}

			models = append(models, mongo.NewReplaceOneModel().
				SetFilter(filter).
				SetReplacement(bsontypes.BsonDeal(dealID, deal)).SetUpsert(true))
		}

		result, err := collection.BulkWrite(ctx, models)
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
}
