package lotusprocs

import (
	"testing"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	repomocks "github.com/protofire/filecoin-CID-checker/internals/repos/mocks"
	"github.com/protofire/filecoin-CID-checker/internals/test"
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

	lotusMock.On("StateMarketDeals", mock.Anything, mock.Anything).
		Return(arguments, nil)

	dealsRepoMock.On("BulkWrite", mock.MatchedBy(func(deals []*bsontypes.MarketDeal) bool {
		var dealsIds []uint64
		for _, deal := range deals {
			dealsIds = append(dealsIds, deal.DealID)
		}

		for id := uint64(1); id <= 2; id++ {
			if !test.Uint64InSlice(id, dealsIds) {
				return false
			}
		}

		return true
	})).Return(nil)

	h := DealsProcessor(lotusMock, dealsRepoMock)
	err := h()

	dealsRepoMock.AssertNumberOfCalls(t, "BulkWrite", 1)

	assert.NoError(t, err)
}
