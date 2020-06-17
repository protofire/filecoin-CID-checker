package handlers

import (
	"context"
	"net/http"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
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
func CreateDealsHandler(mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		pieceCID := c.Query("piececid")
		minerID := c.Query("minerid")

		if pieceCID == "" && minerID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "request error: piececid or minerid requered"})
			return
		}

		dealsCollection := mongoClient.Database("local").Collection("deals")
		dealToSectorsCollection := mongoClient.Database("local").Collection("deals_to_sectors")
		sectorsCollection := mongoClient.Database("local").Collection("sectors")

		var filter bson.M

		if pieceCID != "" {
			filter = bson.M{"proposal.piececid": pieceCID}
		}

		if minerID != "" {
			filter = bson.M{"proposal.provider": minerID}
		}

		cursor, err := dealsCollection.Find(context.Background(), filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var deals []bsontypes.MarketDeal
		if err := cursor.All(context.Background(), &deals); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var results []DealResponse

		for _, deal := range deals {
			dealID := deal.DealID

			filter := bson.M{"_id": dealID}

			var dealToSector bson.M
			if err = dealToSectorsCollection.FindOne(context.Background(), filter).Decode(&dealToSector); err != nil {
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
			if err = sectorsCollection.FindOne(context.Background(), filter).Decode(&sector); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			results = append(results, DealResponse{
				DealInfo:   deal,
				DealID:     uint64(dealID),
				SectorID:   uint64(sectorID),
				SectorInfo: sector,
			})
		}

		c.JSON(http.StatusOK, results)
	}
}
