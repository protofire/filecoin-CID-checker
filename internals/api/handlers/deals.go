package handlers

import (
	"net/http"
	"strconv"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	"github.com/protofire/filecoin-CID-checker/internals/repos"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// DealResponse represents response format for deals related queries.
type DealResponse struct {
	DealID     uint64
	SectorID   uint64
	DealInfo   *bsontypes.MarketDeal
	SectorInfo interface{}
	State      string
}

type Pagination struct {
	Page    uint64 `form:"page"`
	PerPage uint64 `form:"per_page"`
}

type DealsResponse struct {
	Pagination *Pagination
	Deals      []DealResponse
}

// CreateDealsHandler creates handler for /deals requests.
// Returns deals information by deal ID (not CID, just integer id), file CID or miner id (not CID, id in string form similar to "t01000").
func CreateDealsHandler(dealsRepo repos.DealsRepo, sectorsRepo repos.SectorsRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		selector := c.Param("selector")

		pagination, err := bindAndValidatePagination(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var deals []*bsontypes.MarketDeal

		dealID, err := strconv.ParseUint(selector, 10, 64)
		if err == nil {
			deal, err := dealsRepo.GetDeal(dealID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if deal != nil {
				deals = append(deals, deal)
			}
		} else {
			var filter bson.M
			if selector != "" {
				filter = bson.M{"$or": bson.A{bson.M{"proposal.piececid": selector}, bson.M{"proposal.provider": selector}}}
			}

			deals, err = dealsRepo.Find(filter, pagination.Page, pagination.PerPage)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		var results []DealResponse

		for _, deal := range deals {
			dealID := deal.DealID

			sector, err := sectorsRepo.SectorWithDeal(dealID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			var state string
			var sectorID uint64
			if sector != nil {
				if sector.Recovery {
					state = "Recovery"
				} else if sector.Fault {
					state = "Fault"
				} else {
					state = "Active"
				}

				sectorID = uint64(sector.ID)
			}

			results = append(results, DealResponse{
				DealInfo:   deal,
				DealID:     dealID,
				SectorID:   sectorID,
				SectorInfo: sector,
				State:      state,
			})
		}

		response := DealsResponse{
			Pagination: pagination,
			Deals:      results,
		}

		c.JSON(http.StatusOK, response)
	}
}

const maxPerPage = 100
const defaultPerPage = 10

func bindAndValidatePagination(c *gin.Context) (*Pagination, error) {
	var pagination Pagination
	err := c.BindQuery(&pagination)
	if err != nil {
		return nil, err
	}

	if pagination.Page <= 0 {
		pagination.Page = 1
	}

	if pagination.PerPage <= 0 {
		pagination.PerPage = defaultPerPage
	}

	if pagination.PerPage > maxPerPage {
		pagination.PerPage = defaultPerPage
	}

	return &pagination, nil
}
