package bsontypes

import (
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/specs-actors/actors/abi"
	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
)

func BsonSector(info *api.ChainSectorInfo) *SectorInfo {
	return &SectorInfo{
		Info: SectorOnChainInfo{
			Info:               info.Info.Info,
			ActivationEpoch:    info.Info.ActivationEpoch,
			DealWeight:         info.Info.DealWeight.String(),
			VerifiedDealWeight: info.Info.VerifiedDealWeight.String(),
		},
		ID: info.ID,
	}
}

type SectorInfo struct {
	Info SectorOnChainInfo
	ID   abi.SectorNumber

	Fault    bool
	Recovery bool
}

type SectorOnChainInfo struct {
	Info               miner.SectorPreCommitInfo
	ActivationEpoch    abi.ChainEpoch // Epoch at which SectorProveCommit is accepted
	DealWeight         string         // Integral of active deals over sector lifetime
	VerifiedDealWeight string         // Integral of active verified deals over sector lifetime
}
