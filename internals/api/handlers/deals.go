package handlers

import (
	"net/http"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	"github.com/protofire/filecoin-CID-checker/internals/repos"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// DealResponse represents response format for deals related queries.
type DealResponse struct {
	DealID     uint64
	SectorID   uint64
	DealInfo   bsontypes.MarketDeal
	SectorInfo interface{}
}

// CreateDealsHandler creates handler for /deals requests.
// Returns deals information by file CID or miner id (not CID, id in string form similar to "t01000").
func CreateDealsHandler(dealsRepo repos.DealsRepo, sectorsRepo repos.SectorsRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		pieceCID := c.Query("piececid")
		minerID := c.Query("minerid")

		if pieceCID == "" && minerID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "request error: piececid or minerid requered"})
			return
		}

		var filter bson.M

		if pieceCID != "" {
			filter = bson.M{"proposal.piececid": pieceCID}
		}

		if minerID != "" {
			filter = bson.M{"proposal.provider": minerID}
		}

		deals, err := dealsRepo.Find(filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var results []DealResponse

		for _, deal := range deals {
			dealID := deal.DealID

			sector, err := sectorsRepo.SectorWithDeal(dealID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			results = append(results, DealResponse{
				DealInfo:   deal,
				DealID:     dealID,
				SectorID:   uint64(sector.ID),
				SectorInfo: sector,
			})
		}

		c.JSON(http.StatusOK, results)
	}
}
