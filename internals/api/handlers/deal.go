package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func CreateDealHandler(mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		dealIdString := c.Param("dealid")

		dealId, err := strconv.ParseUint(dealIdString, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request: dealid should be integer"})
			return
		}

		dealsCollection := mongoClient.Database("local").Collection("deals")
		dealToSectorsCollection := mongoClient.Database("local").Collection("deals_to_sectors")
		sectorsCollection := mongoClient.Database("local").Collection("sectors")

		filter := bson.M{"_id": dealId}

		var deal bson.M
		if err := dealsCollection.FindOne(context.Background(), filter).Decode(&deal); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var dealToSector bson.M
		if err := dealToSectorsCollection.FindOne(context.Background(), filter).Decode(&dealToSector); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		sectorId, ok := dealToSector["sectorId"].(int64)
		if !ok {
			log.Error("failed to convert sectorId to uint64")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error"})
			return
		}

		filter = bson.M{"_id": sectorId}

		var sector bson.M
		if err := sectorsCollection.FindOne(context.Background(), filter).Decode(&sector); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := DealResponse{
			DealInfo:   deal,
			DealId:     dealId,
			SectorId:   uint64(sectorId),
			SectorInfo: sector,
		}

		c.JSON(http.StatusOK, response)
	}
}
