package lotusprocs

import (
	"testing"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	repomocks "github.com/protofire/filecoin-CID-checker/internals/repos/mocks"
	"github.com/protofire/filecoin-CID-checker/internals/test/mocks"

	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/specs-actors/actors/builtin/market"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestDealsProcessor(t *testing.T) {
	lotusMock := &mocks.FullNode{}
	dealsRepoMock := &repomocks.DealsRepo{}

	arguments := map[string]api.MarketDeal{
		"1": {
			Proposal: market.DealProposal{},
			State:    market.DealState{},
		},
		"2": {
			Proposal: market.DealProposal{},
			State:    market.DealState{},
		},
	}
	expectedWrites := []bsontypes.MarketDeal{
		bsontypes.BsonDeal(1, arguments["1"]),
		bsontypes.BsonDeal(2, arguments["2"]),
	}

	lotusMock.On("StateMarketDeals", mock.Anything, mock.Anything).
		Return(arguments, nil)

	dealsRepoMock.On("BulkWrite", mock.Anything).
		Return(nil)

	h := DealsProcessor(lotusMock, dealsRepoMock)
	err := h()

	dealsRepoMock.AssertCalled(t, "BulkWrite", expectedWrites)

	assert.NoError(t, err)
}
