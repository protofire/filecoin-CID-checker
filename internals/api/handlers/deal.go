package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/protofire/filecoin-CID-checker/internals/repos"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateDealHandler creates handler for /deal/:dealid requests.
// Returns deal information by deal id (not CID, just integer id).
func CreateDealHandler(repo repos.DealsRepo, mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		sDealID := c.Param("dealid")

		dealID, err := strconv.ParseUint(sDealID, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request: dealid should be integer"})
			return
		}

		dealToSectorsCollection := mongoClient.Database("local").Collection("deals_to_sectors")
		sectorsCollection := mongoClient.Database("local").Collection("sectors")

		deal, err := repo.GetDeal(dealID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		filter := bson.M{"_id": dealID}

		var dealToSector bson.M
		if err := dealToSectorsCollection.FindOne(context.Background(), filter).Decode(&dealToSector); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		sectorID, ok := dealToSector["sectorId"].(int64)
		if !ok {
			log.Error("failed to convert sectorId to uint64")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error"})
			return
		}

		filter = bson.M{"_id": sectorID}

		var sector bson.M
		if err := sectorsCollection.FindOne(context.Background(), filter).Decode(&sector); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := DealResponse{
			DealInfo:   deal,
			DealID:     dealID,
			SectorID:   uint64(sectorID),
			SectorInfo: sector,
		}

		c.JSON(http.StatusOK, response)
	}
}
