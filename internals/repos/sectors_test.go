package repos

import (
	"context"
	"testing"

	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/specs-actors/actors/abi"
	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func OpenTestDB(t *testing.T) *mongo.Client {
	log.SetLevel(log.DebugLevel)

	// TODO change to config variables

	// Set client options
	clientOptions := options.Client().ApplyURI("mongodb://localhost:28017")

	// Connect to MongoDB
	mongoClient, err := mongo.Connect(context.Background(), clientOptions)
	assert.NoError(t, err, "failed to connect with test database")

	err = mongoClient.Database("local").Drop(context.Background())
	assert.NoError(t, err, "failed to clear test database")

	return mongoClient
}

func TestMongoSectorsRepo_SectorWithDeal(t *testing.T) {
	db := OpenTestDB(t)
	repo := NewMongoSectorsRepo(db, "")
	seedSectors := []*api.ChainSectorInfo{
		{ID: 1, Info: miner.SectorOnChainInfo{
			Info: miner.SectorPreCommitInfo{
				DealIDs: []abi.DealID{1, 4},
			},
		}},
		{ID: 2, Info: miner.SectorOnChainInfo{
			Info: miner.SectorPreCommitInfo{
				DealIDs: []abi.DealID{3},
			},
		}},
		{ID: 3, Info: miner.SectorOnChainInfo{
			Info: miner.SectorPreCommitInfo{
				DealIDs: []abi.DealID{2},
			},
		}},
	}
	err := repo.BulkWrite(seedSectors)
	assert.NoError(t, err)

	tests := []struct {
		dealID         uint64
		sectorID       uint64
		expectNotFound bool
	}{
		{dealID: 1, sectorID: 1},
		{dealID: 2, sectorID: 3},
		{dealID: 3, sectorID: 2},
		{dealID: 4, sectorID: 1},
		{dealID: 5, expectNotFound: true},
	}

	for _, tt := range tests {
		sector, err := repo.SectorWithDeal(tt.dealID)
		if tt.expectNotFound {
			assert.EqualError(t, err, "mongo: no documents in result")
			continue
		}

		require.NoError(t, err)

		assert.Equal(t, tt.sectorID, uint64(sector.ID))
	}
}

func TestMongoSectorsRepo_SetFaultSectors(t *testing.T) {
	db := OpenTestDB(t)
	repo := NewMongoSectorsRepo(db, "")
	seedSectors := []*api.ChainSectorInfo{{ID: 1}, {ID: 2}, {ID: 3}}
	err := repo.BulkWrite(seedSectors)
	assert.NoError(t, err)

	tests := []struct {
		sectors []uint64
	}{
		{[]uint64{1, 2}},
		{[]uint64{2, 3}},
		{[]uint64{8, 9, 10}},
		{[]uint64{}},
	}
	for _, tt := range tests {
		err = repo.SetFaultSectors(tt.sectors)
		require.NoError(t, err)

		for _, seedSector := range seedSectors {
			isFault := uint64InSlice(uint64(seedSector.ID), tt.sectors)
			sector, err := repo.GetSector(uint64(seedSector.ID))
			assert.NoError(t, err)
			assert.Equal(t, sector.Fault, isFault)
		}
	}
}

func TestMongoSectorsRepo_SetRecoveriesSectors(t *testing.T) {
	db := OpenTestDB(t)
	repo := NewMongoSectorsRepo(db, "")
	seedSectors := []*api.ChainSectorInfo{{ID: 1}, {ID: 2}, {ID: 3}}
	err := repo.BulkWrite(seedSectors)
	require.NoError(t, err)

	tests := []struct {
		sectors []uint64
	}{
		{[]uint64{1, 2}},
		{[]uint64{2, 3}},
		{[]uint64{8, 9, 10}},
		{[]uint64{}},
	}
	for _, tt := range tests {
		err = repo.SetRecoveriesSectors(tt.sectors)
		assert.NoError(t, err)

		for _, seedSector := range seedSectors {
			isRecovery := uint64InSlice(uint64(seedSector.ID), tt.sectors)
			sector, err := repo.GetSector(uint64(seedSector.ID))
			assert.NoError(t, err)
			assert.Equal(t, sector.Recovery, isRecovery)
		}
	}
}

func uint64InSlice(a uint64, list []uint64) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}
