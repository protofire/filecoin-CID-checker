package handlers

import (
	"net/http"
	"strconv"

	"github.com/protofire/filecoin-CID-checker/internals/repos"

	"github.com/gin-gonic/gin"
)

// CreateDealHandler creates handler for /deal/:dealid requests.
// Returns deal information by deal id (not CID, just integer id).
func CreateDealHandler(dealsRepo repos.DealsRepo, sectorsRepo repos.SectorsRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		sDealID := c.Param("dealid")

		dealID, err := strconv.ParseUint(sDealID, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request: dealid should be integer"})
			return
		}

		deal, err := dealsRepo.GetDeal(dealID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		sector, err := sectorsRepo.SectorWithDeal(dealID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := DealResponse{
			DealInfo:   deal,
			DealID:     dealID,
			SectorID:   uint64(sector.ID),
			SectorInfo: sector,
		}

		c.JSON(http.StatusOK, response)
	}
}
