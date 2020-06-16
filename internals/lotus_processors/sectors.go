package lotus_processors

import (
	"context"
	"fmt"

	"github.com/filecoin-project/go-address"
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func SectorsProcessor(lotusApi api.FullNode, mongoClient *mongo.Client) BlockEventHandler {
	return func() error {
		log.Info("Fetching sectors from Lotus node")

		dealsCollection := mongoClient.Database("local").Collection("deals")

		minersList, err := dealsCollection.Distinct(context.Background(), "proposal.provider", bson.M{})
		if err != nil {
			return fmt.Errorf("failed to select distinct miners ids from deals %w", err)
		}

		var dealsToSectorsModels []mongo.WriteModel
		var sectorsModels []mongo.WriteModel

		for _, miner := range minersList {
			minerId, ok := miner.(string)
			if !ok {
				return fmt.Errorf("minerId %v is not a string", minerId)
			}

			minerAddr, err := address.NewFromString(minerId)
			if err != nil {
				return fmt.Errorf("failed to convert %s to miner address: %w", minerId, err)
			}

			// TODO make this Debugf()
			log.Infof("Processing miner %s", minerAddr.String())

			sectors, err := lotusApi.StateMinerSectors(context.Background(), minerAddr, nil, true, types.EmptyTSK)
			if err != nil {
				return err
			}

			for _, sector := range sectors {
				for _, dealId := range sector.Info.Info.DealIDs {
					filter := bson.M{"_id": dealId}
					sectorToDeal := bson.M{"_id": dealId, "sectorId": sector.ID, "minerId": minerId}

					// TODO change replacement to insert?

					dealsToSectorsModels = append(dealsToSectorsModels, mongo.NewReplaceOneModel().
						SetFilter(filter).
						SetReplacement(sectorToDeal).
						SetUpsert(true))

					filter = bson.M{"_id": sector.ID}
					sectorsModels = append(sectorsModels, mongo.NewUpdateOneModel().
						SetFilter(filter).
						SetUpdate(bson.M{"$set": sector}).
						SetUpsert(true))
				}
			}
		}

		if len(sectorsModels) > 0 {
			sectorsCollection := mongoClient.Database("local").Collection("sectors")
			result, err := sectorsCollection.BulkWrite(context.Background(), sectorsModels)
			if err != nil {
				log.WithError(err).Error("Failed to insert sectors data")
				return err
			}

			log.WithFields(log.Fields{
				"InsertedCount": result.InsertedCount,
				"MatchedCount":  result.MatchedCount,
				"ModifiedCount": result.ModifiedCount,
				"DeletedCount":  result.DeletedCount,
				"UpsertedCount": result.UpsertedCount,
			}).Info("Sectors updates")
		}

		if len(dealsToSectorsModels) > 0 {
			dealsToSectorsCollection := mongoClient.Database("local").Collection("deals_to_sectors")
			result, err := dealsToSectorsCollection.BulkWrite(context.Background(), dealsToSectorsModels)
			if err != nil {
				return fmt.Errorf("failed to write deals-to-sectors data: %w", err)
			}

			log.WithFields(log.Fields{
				"InsertedCount": result.InsertedCount,
				"MatchedCount":  result.MatchedCount,
				"ModifiedCount": result.ModifiedCount,
				"DeletedCount":  result.DeletedCount,
				"UpsertedCount": result.UpsertedCount,
			}).Info("DealsToSectors updates")

			log.Debugf("UpsertedIDs %v", result.UpsertedIDs)
		}

		return nil
	}
}
