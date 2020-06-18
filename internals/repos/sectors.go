package repos

import (
	"context"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"

	"github.com/filecoin-project/lotus/api"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type SectorsRepo interface {
	BulkWrite(sectors []*api.ChainSectorInfo) error
	GetSector(sectorID uint64) (bsontypes.SectorInfo, error)
	SetFaultSectors(sectors []uint64) error
	SetRecoveriesSectors(sectors []uint64) error
}

type MongoSectorsRepo struct {
	collection *mongo.Collection
}

func NewMongoSectorsRepo(mongoClient *mongo.Client) *MongoSectorsRepo {
	return &MongoSectorsRepo{
		// TODO replace with config values
		collection: mongoClient.Database("local").Collection("sectors"),
	}
}

func (r *MongoSectorsRepo) BulkWrite(sectors []*api.ChainSectorInfo) error {
	var sectorsModels []mongo.WriteModel

	for _, sector := range sectors {
		filter := bson.M{"_id": sector.ID}

		sectorsModels = append(sectorsModels, mongo.NewUpdateOneModel().
			SetFilter(filter).
			SetUpdate(bson.M{"$set": sector}).
			SetUpsert(true))
	}

	if len(sectorsModels) > 0 {
		result, err := r.collection.BulkWrite(context.Background(), sectorsModels)
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
		}).Debugf("Sectors updated")

		log.Debugf("UpsertedIDs %v", result.UpsertedIDs)
	}

	return nil
}

func (r *MongoSectorsRepo) GetSector(sectorID uint64) (bsontypes.SectorInfo, error) {
	filter := bson.M{"_id": sectorID}

	var sector bsontypes.SectorInfo
	if err := r.collection.FindOne(context.Background(), filter).Decode(&sector); err != nil {
		return bsontypes.SectorInfo{}, err
	}

	return sector, nil
}

func (r *MongoSectorsRepo) updateBoolFields(filter bson.M, name string, value bool) error {
	result, err := r.collection.UpdateMany(context.Background(), filter, bson.M{"$set": bson.M{name: value}})
	if err != nil {
		return err
	}

	log.WithFields(log.Fields{
		"MatchedCount":  result.MatchedCount,
		"ModifiedCount": result.ModifiedCount,
		"UpsertedCount": result.UpsertedCount,
	}).Debugf("Sectors updated")

	return nil
}

func (r *MongoSectorsRepo) setSectors(sectors []uint64, field string) error {
	if len(sectors) > 0 {
		err := r.updateBoolFields(bson.M{"_id": bson.M{"$in": sectors}}, field, true)
		if err != nil {
			return err
		}

		err = r.updateBoolFields(bson.M{"_id": bson.M{"$nin": sectors}}, field, false)
		if err != nil {
			return err
		}
	} else {
		err := r.updateBoolFields(bson.M{}, field, false)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *MongoSectorsRepo) SetFaultSectors(sectors []uint64) error {
	return r.setSectors(sectors, "fault")
}

func (r *MongoSectorsRepo) SetRecoveriesSectors(sectors []uint64) error {
	return r.setSectors(sectors, "recovery")
}
