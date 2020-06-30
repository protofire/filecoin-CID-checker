package handlers

import (
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"testing"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	"github.com/protofire/filecoin-CID-checker/internals/repos/mocks"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
)

func TestCreateDealsHandler(t *testing.T) {
	tests := []struct {
		prepare func(*testing.T, *gin.Context, *mocks.DealsRepo, *mocks.SectorsRepo)
		assert  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				dealsRepoMock.On("Find", mock.Anything, mock.Anything, mock.Anything).
					Return([]*bsontypes.MarketDeal{}, fmt.Errorf("Find error"))
			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 500, w.Code)
				assert.Contains(t, w.Body.String(), "Find error")
			},
		},
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				dealsRepoMock.On("Find", mock.Anything, mock.Anything, mock.Anything).
					Return([]*bsontypes.MarketDeal{
						{DealID: 1},
						{DealID: 2},
						{DealID: 3},
					}, nil)

				sectorsRepoMock.On("SectorWithDeal", uint64(1)).
					Return(&bsontypes.SectorInfo{ID: 11}, nil)
				sectorsRepoMock.On("SectorWithDeal", uint64(2)).
					Return(&bsontypes.SectorInfo{ID: 12, Recovery: true}, nil)
				sectorsRepoMock.On("SectorWithDeal", uint64(3)).
					Return(&bsontypes.SectorInfo{ID: 13, Fault: true}, nil)

			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 200, w.Code)

				var dr DealsResponse
				err := json.Unmarshal(w.Body.Bytes(), &dr)
				assert.NoError(t, err)

				assert.Equal(t, uint64(1), dr.Deals[0].DealID)
				assert.Equal(t, uint64(11), dr.Deals[0].SectorID)
				assert.Equal(t, uint64(2), dr.Deals[1].DealID)
				assert.Equal(t, uint64(12), dr.Deals[1].SectorID)

				assert.Equal(t, "Active", dr.Deals[0].State)
				assert.Equal(t, "Recovery", dr.Deals[1].State)
				assert.Equal(t, "Fault", dr.Deals[2].State)
			},
		},

		// string selector
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				selector := "###"
				c.Params = gin.Params{gin.Param{Key: "selector", Value: selector}}
				dealsRepoMock.On("Find",
					bson.M{"$or": bson.A{bson.M{"proposal.piececid": selector}, bson.M{"proposal.provider": selector}}},
					mock.Anything,
					mock.Anything,
				).
					Return([]*bsontypes.MarketDeal{}, nil)

			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 200, w.Code)

				var dr DealsResponse
				err := json.Unmarshal(w.Body.Bytes(), &dr)
				assert.NoError(t, err)

				assert.Equal(t, []DealResponse(nil), dr.Deals)
			},
		},

		// integer selector
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				selector := "123"
				c.Params = gin.Params{gin.Param{Key: "selector", Value: selector}}
				dealsRepoMock.On("GetDeal", uint64(123)).
					Return(&bsontypes.MarketDeal{DealID: 1}, nil)

				sectorsRepoMock.On("SectorWithDeal", uint64(1)).
					Return(&bsontypes.SectorInfo{ID: 11}, nil)
			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 200, w.Code)

				var dr DealsResponse
				err := json.Unmarshal(w.Body.Bytes(), &dr)
				assert.NoError(t, err)
			},
		},

		// pagination
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				c.Request = httptest.NewRequest("GET", "http://test/deals?page=3&per_page=25", nil)

				dealsRepoMock.On("Find", mock.Anything, uint64(3), uint64(25)).
					Return([]*bsontypes.MarketDeal{}, nil)
			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 200, w.Code)

				var dr DealsResponse
				err := json.Unmarshal(w.Body.Bytes(), &dr)
				assert.NoError(t, err)
			},
		},
	}

	for _, tt := range tests {
		dealsRepoMock := &mocks.DealsRepo{}
		sectorsRepoMock := &mocks.SectorsRepo{}

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "http://test/deals", nil)

		tt.prepare(t, c, dealsRepoMock, sectorsRepoMock)

		h := CreateDealsHandler(dealsRepoMock, sectorsRepoMock)
		h(c)

		tt.assert(t, w)
	}
}
