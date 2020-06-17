package bsontypes

import (
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/specs-actors/actors/abi"
)

// BsonDeal create bson-compatible MarketDeal from api.MarketDeal.
func BsonDeal(dealID uint64, deal api.MarketDeal) MarketDeal {
	return MarketDeal{
		DealID: dealID,
		Proposal: DealProposal{
			PieceCID:     deal.Proposal.PieceCID.String(),
			PieceSize:    uint64(deal.Proposal.PieceSize),
			VerifiedDeal: deal.Proposal.VerifiedDeal,
			Client:       deal.Proposal.Client.String(),
			Provider:     deal.Proposal.Provider.String(),

			StartEpoch:           deal.Proposal.StartEpoch,
			EndEpoch:             deal.Proposal.EndEpoch,
			StoragePricePerEpoch: deal.Proposal.StoragePricePerEpoch,

			ProviderCollateral: deal.Proposal.ProviderCollateral,
			ClientCollateral:   deal.Proposal.ClientCollateral,
		},
		State: DealState{
			SectorStartEpoch: deal.State.SectorStartEpoch,
			LastUpdatedEpoch: deal.State.LastUpdatedEpoch,
			SlashEpoch:       deal.State.SlashEpoch,
		},
	}
}

// MarketDeal bson-compatible version of api.MarketDeal.
type MarketDeal struct {
	DealID   uint64
	Proposal DealProposal
	State    DealState
}

// DealProposal bson-compatible version of api.DealProposal.
type DealProposal struct {
	PieceCID     string // CommP
	PieceSize    uint64
	VerifiedDeal bool
	Client       string
	Provider     string

	// Nominal start epoch. Deal payment is linear between StartEpoch and EndEpoch,
	// with total amount StoragePricePerEpoch * (EndEpoch - StartEpoch).
	// Storage deal must appear in a sealed (proven) sector no later than StartEpoch,
	// otherwise it is invalid.
	StartEpoch           abi.ChainEpoch
	EndEpoch             abi.ChainEpoch
	StoragePricePerEpoch abi.TokenAmount

	ProviderCollateral abi.TokenAmount
	ClientCollateral   abi.TokenAmount
}

// DealState bson-compatible version of api.DealState.
type DealState struct {
	SectorStartEpoch abi.ChainEpoch // -1 if not yet included in proven sector
	LastUpdatedEpoch abi.ChainEpoch // -1 if deal state never updated
	SlashEpoch       abi.ChainEpoch // -1 if deal never slashed
}
