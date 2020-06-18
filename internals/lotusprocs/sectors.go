package lotusprocs

import (
	"context"
	"fmt"

	"github.com/protofire/filecoin-CID-checker/internals/repos"

	"github.com/filecoin-project/go-address"
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// SectorsProcessor read sectors from lotus, trough lotusAPI.
// Saves sectors info to "sectors" collection, and relations of deals with sectors to "deals_to_sectors".
func SectorsProcessor(lotusAPI api.FullNode, dealsRepo repos.DealsRepo, sectorsRepo repos.SectorsRepo, mongoClient *mongo.Client) BlockEventHandler {
	return func() error {
		log.Info("Fetching sectors from Lotus node")

		minersList, err := dealsRepo.Miners()
		if err != nil {
			return err
		}

		var dealsToSectorsModels []mongo.WriteModel
		var allSectors []*api.ChainSectorInfo

		for _, minerID := range minersList {
			minerAddr, err := address.NewFromString(minerID)
			if err != nil {
				return fmt.Errorf("failed to convert %s to miner address: %w", minerID, err)
			}

			// TODO make this Debugf()
			log.Infof("Processing miner %s", minerAddr.String())

			sectors, err := lotusAPI.StateMinerSectors(context.Background(), minerAddr, nil, true, types.EmptyTSK)
			if err != nil {
				return err
			}

			allSectors = append(allSectors, sectors...)

			for _, sector := range sectors {
				for _, dealID := range sector.Info.Info.DealIDs {
					filter := bson.M{"_id": dealID}
					sectorToDeal := bson.M{"_id": dealID, "sectorId": sector.ID, "minerId": minerID}

					// TODO change replacement to insert?

					dealsToSectorsModels = append(dealsToSectorsModels, mongo.NewReplaceOneModel().
						SetFilter(filter).
						SetReplacement(sectorToDeal).
						SetUpsert(true))
				}
			}
		}

		if err := sectorsRepo.BulkWrite(allSectors); err != nil {
			return err
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
			}).Info("DealsToSectors updated")

			log.Debugf("UpsertedIDs %v", result.UpsertedIDs)
		}

		return nil
	}
}
