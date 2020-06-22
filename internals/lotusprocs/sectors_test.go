package lotusprocs

import (
	"fmt"
	"testing"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	repomocks "github.com/protofire/filecoin-CID-checker/internals/repos/mocks"
	"github.com/protofire/filecoin-CID-checker/internals/test"
	"github.com/protofire/filecoin-CID-checker/internals/test/mocks"

	"github.com/filecoin-project/lotus/api"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestSectorsProcessor(t *testing.T) {
	lotusMock := &mocks.FullNode{}
	dealsRepoMock := &repomocks.DealsRepo{}
	sectorsRepoMock := &repomocks.SectorsRepo{}

	dealsRepoMock.On("Miners").
		Return([]string{"t01000", "t01001"}, nil)

	chainSectorInfos := [][]*api.ChainSectorInfo{{
		{ID: 1}, {ID: 2},
	}, {
		{ID: 3},
	}}

	lotusMock.On("StateMinerSectors", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
		Return(chainSectorInfos[0], nil).Once()
	lotusMock.On("StateMinerSectors", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
		Return(chainSectorInfos[1], nil).Once()

	sectorsRepoMock.On("BulkWrite", mock.MatchedBy(func(sectors []*bsontypes.SectorInfo) bool {
		var sectorIds []uint64
		for _, sector := range sectors {
			sectorIds = append(sectorIds, uint64(sector.ID))
		}

		for id := uint64(1); id <= 3; id++ {
			if !test.Uint64InSlice(id, sectorIds) {
				return false
			}
		}
		fmt.Printf("%+v\n", sectors)
		return true
	})).Return(nil)

	h := SectorsProcessor(lotusMock, dealsRepoMock, sectorsRepoMock)
	err := h()

	assert.NoError(t, err)

	sectorsRepoMock.AssertNumberOfCalls(t, "BulkWrite", 1)
}
