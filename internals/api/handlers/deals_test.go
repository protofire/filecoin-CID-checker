package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	"github.com/protofire/filecoin-CID-checker/internals/repos/mocks"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestCreateDealsHandler(t *testing.T) {
	tests := []struct {
		prepare func(*testing.T, *gin.Context, *mocks.DealsRepo, *mocks.SectorsRepo)
		assert  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				req, _ := http.NewRequest("GET", "http://host/deals", nil)
				c.Request = req
			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 400, w.Code)
				assert.Contains(t, w.Body.String(), "piececid or minerid requered")
			},
		},
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				req, _ := http.NewRequest("GET", "http://host/deals?piececid=abc", nil)
				c.Request = req

				dealsRepoMock.On("Find", mock.Anything).
					Return([]bsontypes.MarketDeal{}, fmt.Errorf("Find error"))
			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 500, w.Code)
				assert.Contains(t, w.Body.String(), "Find error")
			},
		},
		{
			prepare: func(t *testing.T, c *gin.Context, dealsRepoMock *mocks.DealsRepo, sectorsRepoMock *mocks.SectorsRepo) {
				req, _ := http.NewRequest("GET", "http://host/deals?piececid=abc", nil)
				c.Request = req

				dealsRepoMock.On("Find", mock.Anything).
					Return([]bsontypes.MarketDeal{
						{DealID: 1},
						{DealID: 2},
					}, nil)

				sectorsRepoMock.On("SectorWithDeal", uint64(1)).
					Return(bsontypes.SectorInfo{ID: 11}, nil)
				sectorsRepoMock.On("SectorWithDeal", uint64(2)).
					Return(bsontypes.SectorInfo{ID: 12}, nil)

			},
			assert: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, 200, w.Code)

				var dr DealsResponse
				err := json.Unmarshal(w.Body.Bytes(), &dr)
				assert.NoError(t, err)

				assert.Equal(t, uint64(1), dr[0].DealID)
				assert.Equal(t, uint64(11), dr[0].SectorID)
				assert.Equal(t, uint64(2), dr[1].DealID)
				assert.Equal(t, uint64(12), dr[1].SectorID)
			},
		},
	}

	for _, tt := range tests {
		dealsRepoMock := &mocks.DealsRepo{}
		sectorsRepoMock := &mocks.SectorsRepo{}

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		tt.prepare(t, c, dealsRepoMock, sectorsRepoMock)

		h := CreateDealsHandler(dealsRepoMock, sectorsRepoMock)
		h(c)

		tt.assert(t, w)
	}
}
