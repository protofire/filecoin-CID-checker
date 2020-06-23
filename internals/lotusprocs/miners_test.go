package lotusprocs

import (
	"bytes"
	"context"
	"testing"

	repomocks "github.com/protofire/filecoin-CID-checker/internals/repos/mocks"
	"github.com/protofire/filecoin-CID-checker/internals/test/mocks"

	"github.com/filecoin-project/lotus/chain/types"
	"github.com/filecoin-project/specs-actors/actors/abi"
	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
	"github.com/filecoin-project/specs-actors/actors/util/adt"
	"github.com/filecoin-project/specs-actors/support/ipld"
	tutils "github.com/filecoin-project/specs-actors/support/testing"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestMinersProcessor(t *testing.T) {
	lotusMock := &mocks.FullNode{}
	dealsRepoMock := &repomocks.DealsRepo{}
	sectorsRepoMock := &repomocks.SectorsRepo{}

	dealsRepoMock.On("Miners").
		Return([]string{"t01000", "t01001"}, nil)

	lotusMock.On("StateGetActor", mock.Anything, mock.Anything, mock.Anything).
		Return(&types.Actor{}, nil)

	state := testMinerState(t)
	w := &bytes.Buffer{}
	err := state.MarshalCBOR(w)
	assert.NoError(t, err)

	lotusMock.On("ChainReadObj", mock.Anything, mock.Anything).
		Return(w.Bytes(), nil)

	sectorsRepoMock.On("SetFaultSectors", mock.Anything).Return(nil)
	sectorsRepoMock.On("SetRecoveriesSectors", mock.Anything).Return(nil)

	h := MinersProcessor(lotusMock, dealsRepoMock, sectorsRepoMock)
	err = h()

	assert.NoError(t, err)
}

// Code based on constructStateHarness function
// github.com/filecoin-project/specs-actors@v0.5.3/actors/builtin/miner/miner_state_test.go
func testMinerState(t *testing.T) *miner.State {
	store := ipld.NewADTStore(context.Background())
	emptyMap, err := adt.MakeEmptyMap(store).Root()
	require.NoError(t, err)

	emptyArray, err := adt.MakeEmptyArray(store).Root()
	require.NoError(t, err)

	emptyDeadlines := miner.ConstructDeadlines()
	emptyDeadlinesCid, err := store.Put(context.Background(), emptyDeadlines)
	require.NoError(t, err)

	owner := tutils.NewBLSAddr(t, 1)
	worker := tutils.NewBLSAddr(t, 2)

	periodBoundary := abi.ChainEpoch(0)

	testMultiaddrs := []abi.Multiaddrs{
		{1},
		{2},
	}

	state, err := miner.ConstructState(emptyArray, emptyMap, emptyDeadlinesCid, owner, worker, abi.PeerID("peer"), testMultiaddrs, abi.RegisteredSealProof_StackedDrg2KiBV1, periodBoundary)
	require.NoError(t, err)

	return state
}
