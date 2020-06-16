package lotus_processors

import (
	"context"
	"fmt"
	"strconv"

	"github.com/protofire/filecoin-CID-checker/internals/bson_types"

	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func DealsProcessor(lotusApi api.FullNode, mongoClient *mongo.Client) BlockEventHandler {
	return func() error {
		log.Info("Fetching deals from Lotus node")

		ctx := context.Background()
		deals, err := lotusApi.StateMarketDeals(ctx, types.EmptyTSK)
		if err != nil {
			log.WithError(err).Error("Failed to execute StateMarketDeals")
		}

		collection := mongoClient.Database("local").Collection("deals")

		var models []mongo.WriteModel
		for dealIdStr, deal := range deals {
			dealId, err := strconv.ParseUint(dealIdStr, 10, 64)
			if err != nil {
				return err
			}

			filter := bson.M{"_id": dealId}

			models = append(models, mongo.NewReplaceOneModel().
				SetFilter(filter).
				SetReplacement(bson_types.BsonDeal(dealId, deal)).SetUpsert(true))
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
		}).Info("Deals updates")

		log.Debugf("UpsertedIDs %v", result.UpsertedIDs)

		return nil
	}
}