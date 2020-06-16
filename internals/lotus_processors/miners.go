package lotus_processors

import (
	"bytes"
	"context"
	"fmt"

	"github.com/filecoin-project/go-address"
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func MinersProcessor(lotusApi api.FullNode, mongoClient *mongo.Client) BlockEventHandler {
	return func() error {
		log.Info("Fetching miners from Lotus node")

		dealsCollection := mongoClient.Database("local").Collection("deals")

		minersList, err := dealsCollection.Distinct(context.Background(), "proposal.provider", bson.M{})
		if err != nil {
			return fmt.Errorf("failed to select distinct miners ids from deals %w", err)
		}

		var sectorsModels []mongo.WriteModel
		var filter bson.M

		// Set all sectors fault and recover to false
		filter = bson.M{}
		sectorsModels = append(sectorsModels, mongo.NewUpdateManyModel().
			SetFilter(filter).
			SetUpdate(bson.M{"$set": bson.M{"fault": false, "recovery": false}}))

		for _, minerData := range minersList {
			minerId, ok := minerData.(string)
			if !ok {
				return fmt.Errorf("minerId %v is not a string", minerId)
			}

			minerAddr, err := address.NewFromString(minerId)
			if err != nil {
				return fmt.Errorf("failed to convert %s to miner address: %w", minerId, err)
			}

			minerActor, err := lotusApi.StateGetActor(context.Background(), minerAddr, types.EmptyTSK)
			if err != nil {
				return err
			}

			minerStateBytes, err := lotusApi.ChainReadObj(context.Background(), minerActor.Head)
			if err != nil {
				return err
			}

			minerStateBuf := bytes.NewBuffer(minerStateBytes)
			minerState := miner.State{}

			if err := minerState.UnmarshalCBOR(minerStateBuf); err != nil {
				return err
			}

			faultSectors, err := minerState.Faults.All(^uint64(0))
			if err != nil {
				return err
			}
			recoveriesSectors, err := minerState.Recoveries.All(^uint64(0))
			if err != nil {
				return err
			}

			for _, faultSectorId := range faultSectors {
				filter = bson.M{"_id": faultSectorId}
				sectorsModels = append(sectorsModels, mongo.NewUpdateOneModel().
					SetFilter(filter).
					SetUpdate(bson.M{"$set": bson.M{"fault": true}}).
					SetUpsert(true))
			}

			for _, recoveriesSectorId := range recoveriesSectors {
				filter = bson.M{"_id": recoveriesSectorId}
				sectorsModels = append(sectorsModels, mongo.NewUpdateOneModel().
					SetFilter(filter).
					SetUpdate(bson.M{"$set": bson.M{"recovery": true}}).
					SetUpsert(true))
			}
		}

		if len(sectorsModels) > 0 {
			sectorsCollection := mongoClient.Database("local").Collection("sectors")
			result, err := sectorsCollection.BulkWrite(context.Background(), sectorsModels)
			if err != nil {
				return fmt.Errorf("failed to update sectors states: %w", err)
			}

			log.WithFields(log.Fields{
				"InsertedCount": result.InsertedCount,
				"MatchedCount":  result.MatchedCount,
				"ModifiedCount": result.ModifiedCount,
				"DeletedCount":  result.DeletedCount,
				"UpsertedCount": result.UpsertedCount,
			}).Info("Sectors states updates")
		}

		return nil
	}
}
