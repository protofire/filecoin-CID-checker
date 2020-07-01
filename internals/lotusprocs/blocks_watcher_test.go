package lotusprocs

import (
	"testing"
	"time"

	"github.com/protofire/filecoin-CID-checker/internals/test/mocks"

	"github.com/filecoin-project/go-address"
	"github.com/filecoin-project/lotus/chain/types"
	"github.com/filecoin-project/specs-actors/actors/crypto"
	"github.com/ipfs/go-cid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestNewBlocksWatcher(t *testing.T) {
	lotusMock := &mocks.FullNode{}

	ts, _ := types.NewTipSet([]*types.BlockHeader{testBlockHeader(t)})

	lotusMock.On("ChainHead", mock.Anything).
		Return(ts, nil)

	var handlerCalled bool
	testHandler := func() error {
		handlerCalled = true
		return nil
	}

	bw := NewBlocksWatcher(CreateLotusClientMock(lotusMock))
	bw.AddBlockEventHandler(testHandler)
	bw.Start()

	time.Sleep(time.Second)

	assert.True(t, handlerCalled)
}

func testBlockHeader(t testing.TB) *types.BlockHeader {
	t.Helper()

	addr, err := address.NewIDAddress(12512063)
	if err != nil {
		t.Fatal(err)
	}

	c, err := cid.Decode("bafyreicmaj5hhoy5mgqvamfhgexxyergw7hdeshizghodwkjg6qmpoco7i")
	if err != nil {
		t.Fatal(err)
	}

	return &types.BlockHeader{
		Miner: addr,
		Ticket: &types.Ticket{
			VRFProof: []byte("vrf proof0000000vrf proof0000000"),
		},
		ElectionProof: &types.ElectionProof{
			VRFProof: []byte("vrf proof0000000vrf proof0000000"),
		},
		Parents:               []cid.Cid{c, c},
		ParentMessageReceipts: c,
		BLSAggregate:          &crypto.Signature{Type: crypto.SigTypeBLS, Data: []byte("boo! im a signature")},
		ParentWeight:          types.NewInt(123125126212),
		Messages:              c,
		Height:                85919298723,
		ParentStateRoot:       c,
		BlockSig:              &crypto.Signature{Type: crypto.SigTypeBLS, Data: []byte("boo! im a signature")},
	}
}
