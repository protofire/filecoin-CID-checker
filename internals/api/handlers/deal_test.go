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
)

func TestCreateDealHandler(t *testing.T) {
	tests := []struct {
		prepare func(*testing.T, *gin.Context, *mocks.DealsRepo, *mocks.SectorsRepo)
		assert  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 400, w.Code)
				assert.Contains(t, w.Body.String(), "dealid should be integer")
			},
		},
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				c.Params = gin.Params{gin.Param{Key: "dealid", Value: "1"}}
				dealsRepoMock.On("GetDeal", mock.AnythingOfType("uint64")).
					Return(bsontypes.MarketDeal{}, fmt.Errorf("GetDeal error"))
			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 500, w.Code)
				assert.Contains(t, w.Body.String(), "GetDeal error")
			},
		},
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				c.Params = gin.Params{gin.Param{Key: "dealid", Value: "1"}}
				dealsRepoMock.On("GetDeal", mock.AnythingOfType("uint64")).
					Return(bsontypes.MarketDeal{}, nil)

				sectorsRepoMock.On("SectorWithDeal", mock.AnythingOfType("uint64")).
					Return(bsontypes.SectorInfo{}, fmt.Errorf("SectorWithDeal error"))
			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 500, w.Code)
				assert.Contains(t, w.Body.String(), "SectorWithDeal error")
			},
		},
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				c.Params = gin.Params{gin.Param{Key: "dealid", Value: "1"}}
				dealsRepoMock.On("GetDeal", mock.AnythingOfType("uint64")).
					Return(bsontypes.MarketDeal{DealID: 1}, nil)

				sectorsRepoMock.On("SectorWithDeal", mock.AnythingOfType("uint64")).
					Return(bsontypes.SectorInfo{ID: 2}, nil)
			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 200, w.Code)

				dr := &DealResponse{}
				err := json.Unmarshal(w.Body.Bytes(), dr)
				assert.NoError(t, err)

				assert.Equal(t, uint64(1), dr.DealID)
				assert.Equal(t, uint64(1), dr.DealInfo.DealID)
				assert.Equal(t, uint64(2), dr.SectorID)
			},
		},
	}

	for _, tt := range tests {
		dealsRepoMock := &mocks.DealsRepo{}
		sectorsRepoMock := &mocks.SectorsRepo{}

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		tt.prepare(t, c, dealsRepoMock, sectorsRepoMock)

		h := CreateDealHandler(dealsRepoMock, sectorsRepoMock)
		h(c)

		tt.assert(t, w)
	}
}
