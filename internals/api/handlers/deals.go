package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type DealResponse struct {
	DealId     string
	SectorId   int64
	DealInfo   interface{}
	SectorInfo interface{}
}

func CreateDealsHandler(mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		pieceCid := c.Query("piececid")
		minerId := c.Query("minerid")

		if pieceCid == "" && minerId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "request error: piececid or minerid requered"})
			return
		}

		dealsCollection := mongoClient.Database("local").Collection("deals")
		dealToSectorsCollection := mongoClient.Database("local").Collection("deals_to_sectors")
		sectorsCollection := mongoClient.Database("local").Collection("sectors")

		var filter bson.M

		if pieceCid != "" {
			filter = bson.M{"proposal.piececid": pieceCid}
		}

		if minerId != "" {
			filter = bson.M{"proposal.provider": minerId}
		}

		cursor, err := dealsCollection.Find(context.Background(), filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var deals []bson.M
		if err := cursor.All(context.Background(), &deals); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var results []DealResponse

		for _, deal := range deals {
			dealIdStr := deal["dealid"].(string)
			dealId, err := strconv.ParseInt(dealIdStr, 10, 64)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			filter := bson.M{"_id": dealId}

			var dealToSector bson.M
			if err = dealToSectorsCollection.FindOne(context.Background(), filter).Decode(&dealToSector); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			sectorId := dealToSector["sectorId"].(int64)

			filter = bson.M{"_id": sectorId}

			var sector bson.M
			if err = sectorsCollection.FindOne(context.Background(), filter).Decode(&sector); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			results = append(results, DealResponse{
				DealInfo:   deal,
				DealId:     dealIdStr,
				SectorId:   sectorId,
				SectorInfo: sector,
			})
		}

		c.JSON(http.StatusOK, results)
	}
}
