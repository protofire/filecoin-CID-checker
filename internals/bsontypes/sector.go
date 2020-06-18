package bsontypes

import (
	"github.com/filecoin-project/specs-actors/actors/abi"
	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
)

type SectorInfo struct {
	Info miner.SectorOnChainInfo
	ID   abi.SectorNumber

	Fault    bool
	Recovery bool
}
