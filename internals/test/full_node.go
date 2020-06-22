package test

import (
	"context"

	"github.com/filecoin-project/go-address"
	"github.com/filecoin-project/go-fil-markets/storagemarket"
	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/lotus/chain/types"
	"github.com/filecoin-project/lotus/node/modules/dtypes"
	"github.com/filecoin-project/specs-actors/actors/abi"
	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
	"github.com/filecoin-project/specs-actors/actors/builtin/paych"
	"github.com/filecoin-project/specs-actors/actors/crypto"
	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/peer"
)

// FullNode is a slightly modified copy of github.com/filecoin-project/lotus@v0.3.0/api/api_full.go, required to generate mocks
type FullNode interface {
	api.Common

	// TODO: TipSetKeys

	// chain

	// ChainNotify returns channel with chain head updates
	// First message is guaranteed to be of len == 1, and type == 'current'
	ChainNotify(context.Context) (<-chan []*api.HeadChange, error)
	ChainHead(context.Context) (*types.TipSet, error)
	ChainGetRandomness(ctx context.Context, tsk types.TipSetKey, personalization crypto.DomainSeparationTag, randEpoch abi.ChainEpoch, entropy []byte) (abi.Randomness, error)
	ChainGetBlock(context.Context, cid.Cid) (*types.BlockHeader, error)
	ChainGetTipSet(context.Context, types.TipSetKey) (*types.TipSet, error)
	ChainGetBlockMessages(context.Context, cid.Cid) (*api.BlockMessages, error)
	ChainGetParentReceipts(context.Context, cid.Cid) ([]*types.MessageReceipt, error)
	ChainGetParentMessages(context.Context, cid.Cid) ([]api.Message, error)
	ChainGetTipSetByHeight(context.Context, abi.ChainEpoch, types.TipSetKey) (*types.TipSet, error)
	ChainReadObj(context.Context, cid.Cid) ([]byte, error)
	ChainHasObj(context.Context, cid.Cid) (bool, error)
	ChainStatObj(context.Context, cid.Cid, cid.Cid) (api.ObjStat, error)
	ChainSetHead(context.Context, types.TipSetKey) error
	ChainGetGenesis(context.Context) (*types.TipSet, error)
	ChainTipSetWeight(context.Context, types.TipSetKey) (types.BigInt, error)
	ChainGetNode(ctx context.Context, p string) (*api.IpldObject, error)
	ChainGetMessage(context.Context, cid.Cid) (*types.Message, error)
	ChainGetPath(ctx context.Context, from types.TipSetKey, to types.TipSetKey) ([]*api.HeadChange, error)
	ChainExport(context.Context, types.TipSetKey) (<-chan []byte, error)

	// syncer
	SyncState(context.Context) (*api.SyncState, error)
	SyncSubmitBlock(ctx context.Context, blk *types.BlockMsg) error
	SyncIncomingBlocks(ctx context.Context) (<-chan *types.BlockHeader, error)
	SyncMarkBad(ctx context.Context, bcid cid.Cid) error
	SyncCheckBad(ctx context.Context, bcid cid.Cid) (string, error)

	// messages
	MpoolPending(context.Context, types.TipSetKey) ([]*types.SignedMessage, error)
	MpoolPush(context.Context, *types.SignedMessage) (cid.Cid, error)
	MpoolPushMessage(context.Context, *types.Message) (*types.SignedMessage, error) // get nonce, sign, push
	MpoolGetNonce(context.Context, address.Address) (uint64, error)
	MpoolSub(context.Context) (<-chan api.MpoolUpdate, error)
	MpoolEstimateGasPrice(context.Context, uint64, address.Address, int64, types.TipSetKey) (types.BigInt, error)

	// FullNodeStruct

	// miner

	MinerGetBaseInfo(context.Context, address.Address, abi.ChainEpoch, types.TipSetKey) (*api.MiningBaseInfo, error)
	MinerCreateBlock(context.Context, *api.BlockTemplate) (*types.BlockMsg, error)

	// // UX ?

	// wallet

	WalletNew(context.Context, crypto.SigType) (address.Address, error)
	WalletHas(context.Context, address.Address) (bool, error)
	WalletList(context.Context) ([]address.Address, error)
	WalletBalance(context.Context, address.Address) (types.BigInt, error)
	WalletSign(context.Context, address.Address, []byte) (*crypto.Signature, error)
	WalletSignMessage(context.Context, address.Address, *types.Message) (*types.SignedMessage, error)
	WalletVerify(context.Context, address.Address, []byte, *crypto.Signature) bool
	WalletDefaultAddress(context.Context) (address.Address, error)
	WalletSetDefault(context.Context, address.Address) error
	WalletExport(context.Context, address.Address) (*types.KeyInfo, error)
	WalletImport(context.Context, *types.KeyInfo) (address.Address, error)

	// Other

	// ClientImport imports file under the specified path into filestore
	ClientImport(ctx context.Context, ref api.FileRef) (cid.Cid, error)
	ClientStartDeal(ctx context.Context, params *api.StartDealParams) (*cid.Cid, error)
	ClientGetDealInfo(context.Context, cid.Cid) (*api.DealInfo, error)
	ClientListDeals(ctx context.Context) ([]api.DealInfo, error)
	ClientHasLocal(ctx context.Context, root cid.Cid) (bool, error)
	ClientFindData(ctx context.Context, root cid.Cid) ([]api.QueryOffer, error)
	ClientRetrieve(ctx context.Context, order api.RetrievalOrder, ref api.FileRef) error
	ClientQueryAsk(ctx context.Context, p peer.ID, miner address.Address) (*storagemarket.SignedStorageAsk, error)
	ClientCalcCommP(ctx context.Context, inpath string, miner address.Address) (*api.CommPRet, error)
	ClientGenCar(ctx context.Context, ref api.FileRef, outpath string) error

	// ClientUnimport removes references to the specified file from filestore
	//ClientUnimport(path string)

	// ClientListImports lists imported files and their root CIDs
	ClientListImports(ctx context.Context) ([]api.Import, error)

	//ClientListAsks() []Ask

	// if tipset is nil, we'll use heaviest
	StateCall(context.Context, *types.Message, types.TipSetKey) (*api.InvocResult, error)
	StateReplay(context.Context, types.TipSetKey, cid.Cid) (*api.InvocResult, error)
	StateGetActor(ctx context.Context, actor address.Address, tsk types.TipSetKey) (*types.Actor, error)
	StateReadState(ctx context.Context, act *types.Actor, tsk types.TipSetKey) (*api.ActorState, error)
	StateListMessages(ctx context.Context, match *types.Message, tsk types.TipSetKey, toht abi.ChainEpoch) ([]cid.Cid, error)

	StateNetworkName(context.Context) (dtypes.NetworkName, error)
	StateMinerSectors(context.Context, address.Address, *abi.BitField, bool, types.TipSetKey) ([]*api.ChainSectorInfo, error)
	StateMinerProvingSet(context.Context, address.Address, types.TipSetKey) ([]*api.ChainSectorInfo, error)
	StateMinerProvingDeadline(context.Context, address.Address, types.TipSetKey) (*miner.DeadlineInfo, error)
	StateMinerPower(context.Context, address.Address, types.TipSetKey) (*api.MinerPower, error)
	StateMinerInfo(context.Context, address.Address, types.TipSetKey) (miner.MinerInfo, error)
	StateMinerDeadlines(context.Context, address.Address, types.TipSetKey) (*miner.Deadlines, error)
	StateMinerFaults(context.Context, address.Address, types.TipSetKey) ([]abi.SectorNumber, error)
	StateMinerInitialPledgeCollateral(context.Context, address.Address, abi.SectorNumber, types.TipSetKey) (types.BigInt, error)
	StateMinerAvailableBalance(context.Context, address.Address, types.TipSetKey) (types.BigInt, error)
	StateSectorPreCommitInfo(context.Context, address.Address, abi.SectorNumber, types.TipSetKey) (miner.SectorPreCommitOnChainInfo, error)
	StatePledgeCollateral(context.Context, types.TipSetKey) (types.BigInt, error)
	StateWaitMsg(context.Context, cid.Cid) (*api.MsgLookup, error)
	StateSearchMsg(context.Context, cid.Cid) (*api.MsgLookup, error)
	StateListMiners(context.Context, types.TipSetKey) ([]address.Address, error)
	StateListActors(context.Context, types.TipSetKey) ([]address.Address, error)
	StateMarketBalance(context.Context, address.Address, types.TipSetKey) (api.MarketBalance, error)
	StateMarketParticipants(context.Context, types.TipSetKey) (map[string]api.MarketBalance, error)
	StateMarketDeals(context.Context, types.TipSetKey) (map[string]api.MarketDeal, error)
	StateMarketStorageDeal(context.Context, abi.DealID, types.TipSetKey) (*api.MarketDeal, error)
	StateLookupID(context.Context, address.Address, types.TipSetKey) (address.Address, error)
	StateAccountKey(context.Context, address.Address, types.TipSetKey) (address.Address, error)
	StateChangedActors(context.Context, cid.Cid, cid.Cid) (map[string]types.Actor, error)
	StateGetReceipt(context.Context, cid.Cid, types.TipSetKey) (*types.MessageReceipt, error)
	StateMinerSectorCount(context.Context, address.Address, types.TipSetKey) (api.MinerSectors, error)
	StateCompute(context.Context, abi.ChainEpoch, []*types.Message, types.TipSetKey) (*api.ComputeStateOutput, error)

	MsigGetAvailableBalance(context.Context, address.Address, types.TipSetKey) (types.BigInt, error)
	MsigCreate(context.Context, int64, []address.Address, types.BigInt, address.Address, types.BigInt) (cid.Cid, error)
	MsigPropose(context.Context, address.Address, address.Address, types.BigInt, address.Address, uint64, []byte) (cid.Cid, error)
	MsigApprove(context.Context, address.Address, uint64, address.Address, address.Address, types.BigInt, address.Address, uint64, []byte) (cid.Cid, error)
	MsigCancel(context.Context, address.Address, uint64, address.Address, address.Address, types.BigInt, address.Address, uint64, []byte) (cid.Cid, error)

	MarketEnsureAvailable(context.Context, address.Address, address.Address, types.BigInt) (cid.Cid, error)
	// MarketFreeBalance

	PaychGet(ctx context.Context, from, to address.Address, ensureFunds types.BigInt) (*api.ChannelInfo, error)
	PaychList(context.Context) ([]address.Address, error)
	PaychStatus(context.Context, address.Address) (*api.PaychStatus, error)
	PaychClose(context.Context, address.Address) (cid.Cid, error)
	PaychAllocateLane(ctx context.Context, ch address.Address) (uint64, error)
	PaychNewPayment(ctx context.Context, from, to address.Address, vouchers []api.VoucherSpec) (*api.PaymentInfo, error)
	PaychVoucherCheckValid(context.Context, address.Address, *paych.SignedVoucher) error
	PaychVoucherCheckSpendable(context.Context, address.Address, *paych.SignedVoucher, []byte, []byte) (bool, error)
	PaychVoucherCreate(context.Context, address.Address, types.BigInt, uint64) (*paych.SignedVoucher, error)
	PaychVoucherAdd(context.Context, address.Address, *paych.SignedVoucher, []byte, types.BigInt) (types.BigInt, error)
	PaychVoucherList(context.Context, address.Address) ([]*paych.SignedVoucher, error)
	PaychVoucherSubmit(context.Context, address.Address, *paych.SignedVoucher) (cid.Cid, error)
}
