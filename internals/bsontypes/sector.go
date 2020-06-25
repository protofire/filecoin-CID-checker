package bsontypes

import (
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/specs-actors/actors/abi"
)

func BsonSector(info *api.ChainSectorInfo) *SectorInfo {
	return &SectorInfo{
		Info: SectorOnChainInfo{
			Info: SectorPreCommitInfo{
				SealProof:     info.Info.Info.SealProof,
				SectorNumber:  info.Info.Info.SectorNumber,
				SealedCID:     info.Info.Info.SealedCID.String(),
				SealRandEpoch: info.Info.Info.SealRandEpoch,
				DealIDs:       info.Info.Info.DealIDs,
				Expiration:    info.Info.Info.Expiration,
			},

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
	Info               SectorPreCommitInfo
	ActivationEpoch    abi.ChainEpoch // Epoch at which SectorProveCommit is accepted
	DealWeight         string         // Integral of active deals over sector lifetime
	VerifiedDealWeight string         // Integral of active verified deals over sector lifetime
}

type SectorPreCommitInfo struct {
	SealProof     abi.RegisteredSealProof
	SectorNumber  abi.SectorNumber
	SealedCID     string // CommR
	SealRandEpoch abi.ChainEpoch
	DealIDs       []abi.DealID
	Expiration    abi.ChainEpoch // Sector Expiration
}
