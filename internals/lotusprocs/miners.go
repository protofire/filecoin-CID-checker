package lotusprocs

import (
	"bytes"
	"context"
	"fmt"

	"github.com/protofire/filecoin-CID-checker/internals/repos"

	"github.com/filecoin-project/go-address"
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
	log "github.com/sirupsen/logrus"
)

// MinersProcessor read miners from lotus, trough lotusAPI and save miner sectors states to "sectors" mongo collection.
func MinersProcessor(lotusAPI api.FullNode, dealsRepo repos.DealsRepo, sectorsRepo repos.SectorsRepo) BlockEventHandler {
	return func() error {
		log.Info("Fetching miners from Lotus node")

		minersList, err := dealsRepo.Miners()
		if err != nil {
			return err
		}

		var allFaultSectors, allRecoveriesSectors []uint64

		for _, minerID := range minersList {
			minerAddr, err := address.NewFromString(minerID)
			if err != nil {
				return fmt.Errorf("failed to convert %s to miner address: %w", minerID, err)
			}

			minerActor, err := lotusAPI.StateGetActor(context.Background(), minerAddr, types.EmptyTSK)
			if err != nil {
				return fmt.Errorf("failed StateGetActor: %w", err)
			}

			minerStateBytes, err := lotusAPI.ChainReadObj(context.Background(), minerActor.Head)
			if err != nil {
				return fmt.Errorf("failed ChainReadObj: %w", err)
			}

			minerStateBuf := bytes.NewBuffer(minerStateBytes)
			minerState := miner.State{}

			if err := minerState.UnmarshalCBOR(minerStateBuf); err != nil {
				return fmt.Errorf("failed minerState.UnmarshalCBOR: %w", err)
			}

			faultSectors, err := minerState.Faults.All(^uint64(0))
			if err != nil {
				return err
			}
			allFaultSectors = append(allFaultSectors, faultSectors...)

			recoveriesSectors, err := minerState.Recoveries.All(^uint64(0))
			if err != nil {
				return err
			}
			allRecoveriesSectors = append(allRecoveriesSectors, recoveriesSectors...)
		}

		if err := sectorsRepo.SetFaultSectors(allFaultSectors); err != nil {
			return err
		}
		if err := sectorsRepo.SetRecoveriesSectors(allRecoveriesSectors); err != nil {
			return err
		}

		return nil
	}
}
