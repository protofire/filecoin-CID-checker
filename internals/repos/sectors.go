package repos

import (
	"context"
	"strings"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type SectorsRepo interface {
	BulkWrite(sectors []*bsontypes.SectorInfo) error
	GetSector(sectorID uint64) (bsontypes.SectorInfo, error)
	SetFaultSectors(sectors []uint64) error
	SetRecoveriesSectors(sectors []uint64) error
	SectorWithDeal(dealID uint64) (bsontypes.SectorInfo, error)
	CreateIndexes() error
}

const sectorsCollectionName = "sectors"

type MongoSectorsRepo struct {
	collection *mongo.Collection
}

func NewMongoSectorsRepo(mongoClient *mongo.Client, dbName string) *MongoSectorsRepo {
	return &MongoSectorsRepo{
		collection: mongoClient.Database(dbName).Collection(sectorsCollectionName),
	}
}

func (r *MongoSectorsRepo) BulkWrite(sectors []*bsontypes.SectorInfo) error {
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

func (r *MongoSectorsRepo) SectorWithDeal(dealID uint64) (bsontypes.SectorInfo, error) {
	filter := bson.M{"info.info.dealids": dealID}

	var sector bsontypes.SectorInfo
	if err := r.collection.FindOne(context.Background(), filter).Decode(&sector); err != nil {
		return bsontypes.SectorInfo{}, err
	}

	return sector, nil
}

func (r *MongoSectorsRepo) updateBoolField(filter bson.M, name string, value bool) error {
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
		err := r.updateBoolField(bson.M{"_id": bson.M{"$in": sectors}}, field, true)
		if err != nil {
			return err
		}

		err = r.updateBoolField(bson.M{"_id": bson.M{"$nin": sectors}}, field, false)
		if err != nil {
			return err
		}
	} else {
		err := r.updateBoolField(bson.M{}, field, false)
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

func (r *MongoSectorsRepo) CreateIndexes() error {
	models := []mongo.IndexModel{
		{Keys: bson.M{"info.info.dealids": 1}},
	}

	newIndexes, err := r.collection.Indexes().CreateMany(context.Background(), models)
	if err != nil {
		return err
	}

	log.Infof(`Collection "%s" indexes created: %s`, sectorsCollectionName, strings.Join(newIndexes, ", "))

	return nil
}
