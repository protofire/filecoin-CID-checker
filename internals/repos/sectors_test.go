package repos

import (
	"testing"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	"github.com/protofire/filecoin-CID-checker/internals/test"

	"github.com/filecoin-project/specs-actors/actors/abi"
	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func mongoSectorsRepo(t *testing.T) *MongoSectorsRepo {
	db := test.Setup(t)
	return NewMongoSectorsRepo(db, "local")
}

func TestMongoSectorsRepo_SectorWithDeal(t *testing.T) {
	repo := mongoSectorsRepo(t)
	seedSectors := []*bsontypes.SectorInfo{
		{ID: 1, Info: bsontypes.SectorOnChainInfo{
			Info: miner.SectorPreCommitInfo{
				DealIDs: []abi.DealID{1, 4},
			},
		}},
		{ID: 2, Info: bsontypes.SectorOnChainInfo{
			Info: miner.SectorPreCommitInfo{
				DealIDs: []abi.DealID{3},
			},
		}},
		{ID: 3, Info: bsontypes.SectorOnChainInfo{
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
			assert.Nil(t, sector)
			continue
		}

		require.NoError(t, err)

		assert.Equal(t, tt.sectorID, uint64(sector.ID))
	}
}

func TestMongoSectorsRepo_SetFaultSectors(t *testing.T) {
	repo := mongoSectorsRepo(t)
	seedSectors := []*bsontypes.SectorInfo{{ID: 1}, {ID: 2}, {ID: 3}}
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
			isFault := test.Uint64InSlice(uint64(seedSector.ID), tt.sectors)
			sector, err := repo.GetSector(uint64(seedSector.ID))
			assert.NoError(t, err)
			assert.Equal(t, sector.Fault, isFault)
		}
	}
}

func TestMongoSectorsRepo_SetRecoveriesSectors(t *testing.T) {
	repo := mongoSectorsRepo(t)
	seedSectors := []*bsontypes.SectorInfo{{ID: 1}, {ID: 2}, {ID: 3}}
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
			isRecovery := test.Uint64InSlice(uint64(seedSector.ID), tt.sectors)
			sector, err := repo.GetSector(uint64(seedSector.ID))
			assert.NoError(t, err)
			assert.Equal(t, sector.Recovery, isRecovery)
		}
	}
}
