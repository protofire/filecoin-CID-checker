package lotusprocs

import (
	"context"
	"fmt"
	"strconv"

	"github.com/protofire/filecoin-CID-checker/internals/bsontypes"
	"github.com/protofire/filecoin-CID-checker/internals/repos"

	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	log "github.com/sirupsen/logrus"
)

// DealsProcessor read deals from lotus, trough lotusAPI and save to "deals" mongo collection.
func DealsProcessor(lotusAPI api.FullNode, dealsRepo repos.DealsRepo) BlockEventHandler {
	return func() error {
		log.Info("Fetching deals from Lotus node")

		ctx := context.Background()
		deals, err := lotusAPI.StateMarketDeals(ctx, types.EmptyTSK)
		if err != nil {
			log.WithError(err).Error("Failed to execute StateMarketDeals")
		}

		var bDeals []bsontypes.MarketDeal

		for sDealID, deal := range deals {
			dealID, err := strconv.ParseUint(sDealID, 10, 64)
			if err != nil {
				return err
			}

			bDeals = append(bDeals, bsontypes.BsonDeal(dealID, deal))
		}

		if err := dealsRepo.BulkWrite(bDeals); err != nil {
			return fmt.Errorf("failed to write deals data: %w", err)
		}

		return nil
	}
}
