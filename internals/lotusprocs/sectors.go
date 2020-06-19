package lotusprocs

import (
	"context"
	"fmt"

	"github.com/protofire/filecoin-CID-checker/internals/repos"

	"github.com/filecoin-project/go-address"
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	log "github.com/sirupsen/logrus"
)

// SectorsProcessor read sectors from lotus, trough lotusAPI.
// Saves sectors info to "sectors" collection.
func SectorsProcessor(lotusAPI api.FullNode, dealsRepo repos.DealsRepo, sectorsRepo repos.SectorsRepo) BlockEventHandler {
	return func() error {
		log.Info("Fetching sectors from Lotus node")

		minersList, err := dealsRepo.Miners()
		if err != nil {
			return err
		}

		var allSectors []*api.ChainSectorInfo

		for _, minerID := range minersList {
			minerAddr, err := address.NewFromString(minerID)
			if err != nil {
				return fmt.Errorf("failed to convert %s to miner address: %w", minerID, err)
			}

			log.Debugf("Processing miner %s sectors", minerAddr.String())

			sectors, err := lotusAPI.StateMinerSectors(context.Background(), minerAddr, nil, true, types.EmptyTSK)
			if err != nil {
				return err
			}

			allSectors = append(allSectors, sectors...)
		}

		if err := sectorsRepo.BulkWrite(allSectors); err != nil {
			return err
		}

		return nil
	}
}
