package lotusprocs

import (
	"bytes"
	"testing"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	"github.com/protofire/filecoin-CID-checker/internals/repos"
	"github.com/protofire/filecoin-CID-checker/internals/test"
	"github.com/protofire/filecoin-CID-checker/internals/test/mocks"

	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	"github.com/filecoin-project/specs-actors/actors/abi"
	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// Test assures that miners and sectors processors want overwrite each other results
func TestSectorStatesOverwrite(t *testing.T) {
	db := test.Setup(t)
	dealsRepo := repos.NewMongoDealsRepo(db, "local")
	sectorsRepo := repos.NewMongoSectorsRepo(db, "local")
	lotusMock := &mocks.FullNode{}

	seedSectors := []*bsontypes.SectorInfo{
		{ID: 1, Info: bsontypes.SectorOnChainInfo{
			Info: miner.SectorPreCommitInfo{
				DealIDs: []abi.DealID{1, 2},
			},
		}},
		{ID: 2, Info: bsontypes.SectorOnChainInfo{
			Info: miner.SectorPreCommitInfo{
				DealIDs: []abi.DealID{3},
			},
		}},
	}
	require.NoError(t, sectorsRepo.BulkWrite(seedSectors))

	// For this test only miner id is necessary
	seedDeals := []*bsontypes.MarketDeal{{Proposal: bsontypes.DealProposal{Provider: "t01000"}}}
	require.NoError(t, dealsRepo.BulkWrite(seedDeals))

	sectorsProcessor := SectorsProcessor(lotusMock, dealsRepo, sectorsRepo)
	minersProcessor := MinersProcessor(lotusMock, dealsRepo, sectorsRepo)

	lotusMock.On("StateGetActor", mock.Anything, mock.Anything, mock.Anything).
		Return(&types.Actor{}, nil)

	state := testMinerState(t)

	state.Recoveries = abi.NewBitField()
	state.Recoveries.Set(1)

	state.Faults = abi.NewBitField()
	state.Faults.Set(2)

	w := &bytes.Buffer{}
	err := state.MarshalCBOR(w)
	assert.NoError(t, err)

	lotusMock.On("ChainReadObj", mock.Anything, mock.Anything).
		Return(w.Bytes(), nil)

	chainSectorInfos := []*api.ChainSectorInfo{
		{ID: 1}, {ID: 2},
	}
	lotusMock.On("StateMinerSectors", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
		Return(chainSectorInfos, nil).Once()

	assert.NoError(t, minersProcessor())
	assert.NoError(t, sectorsProcessor())

	sector1, err := sectorsRepo.GetSector(uint64(1))
	require.NoError(t, err)
	sector2, err := sectorsRepo.GetSector(uint64(2))
	require.NoError(t, err)

	assert.True(t, sector1.Recovery)
	assert.True(t, sector2.Fault)
}
