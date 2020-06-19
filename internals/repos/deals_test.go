package repos

import (
	"testing"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	"github.com/protofire/filecoin-CID-checker/internals/test"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func mongoDealsRepo(t *testing.T) *MongoDealsRepo {
	db := test.Setup(t)
	return NewMongoDealsRepo(db, "local")
}

func TestMongoDealsRepo_GetDeal(t *testing.T) {
	repo := mongoDealsRepo(t)
	seedDeals := []bsontypes.MarketDeal{
		{
			DealID: 1,
			Proposal: bsontypes.DealProposal{
				PieceCID:             "test",
				PieceSize:            1000,
				VerifiedDeal:         false,
				Client:               "test_client",
				Provider:             "test_provider",
				StartEpoch:           1,
				EndEpoch:             2,
				StoragePricePerEpoch: "1",
				ProviderCollateral:   "2",
				ClientCollateral:     "3",
			},
			State: bsontypes.DealState{
				SectorStartEpoch: 1,
				LastUpdatedEpoch: 2,
				SlashEpoch:       3,
			},
		},
		{
			DealID: 2,
		},
	}
	err := repo.BulkWrite(seedDeals)
	require.NoError(t, err)

	for _, seedDeal := range seedDeals {
		deal, err := repo.GetDeal(seedDeal.DealID)
		assert.NoError(t, err)
		assert.Equal(t, seedDeal, deal)
	}
}

func TestMongoDealsRepo_Miners(t *testing.T) {
	repo := mongoDealsRepo(t)

	seedDeals := []bsontypes.MarketDeal{
		{
			DealID: 1,
			Proposal: bsontypes.DealProposal{
				Provider: "miner1",
			},
		},
		{
			DealID: 2,
			Proposal: bsontypes.DealProposal{
				Provider: "miner1",
			},
		},
		{
			DealID: 3,
			Proposal: bsontypes.DealProposal{
				Provider: "miner2",
			},
		},
	}
	err := repo.BulkWrite(seedDeals)
	require.NoError(t, err)

	miners, err := repo.Miners()
	require.NoError(t, err)

	assert.Len(t, miners, 2)
	assert.Contains(t, miners, "miner1")
	assert.Contains(t, miners, "miner2")
}
