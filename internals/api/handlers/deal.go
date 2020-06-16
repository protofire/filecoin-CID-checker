package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func CreateDealHandler(mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		dealId := c.Param("dealid")

		dealsCollection := mongoClient.Database("local").Collection("deals")
		dealToSectorsCollection := mongoClient.Database("local").Collection("deals_to_sectors")
		sectorsCollection := mongoClient.Database("local").Collection("sectors")

		filter := bson.M{"_id": dealId}

		result := dealsCollection.FindOne(context.Background(), filter)
		if result.Err() != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err().Error()})
			return
		}

		var deal bson.M
		if err := result.Decode(&deal); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var dealToSector bson.M
		if err := dealToSectorsCollection.FindOne(context.Background(), filter).Decode(&dealToSector); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		sectorId := dealToSector["sectorId"].(int64)

		filter = bson.M{"_id": sectorId}

		var sector bson.M
		if err := sectorsCollection.FindOne(context.Background(), filter).Decode(&sector); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := DealResponse{
			DealInfo:   deal,
			DealId:     dealId,
			SectorId:   sectorId,
			SectorInfo: sector,
		}

		c.JSON(http.StatusOK, response)
	}
}
