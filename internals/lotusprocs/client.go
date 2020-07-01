package lotusprocs

import (
	"net/http"

	"github.com/filecoin-project/go-jsonrpc"
	"github.com/filecoin-project/lotus/api"
	apiclient "github.com/filecoin-project/lotus/api/client"
	log "github.com/sirupsen/logrus"
)

type LotusClient interface {
	Connect() error
	Reconnect() error
	Disconnect()

	LotusAPI() api.FullNode
}

type LotusClientRPC struct {
	lotusAPI api.FullNode
	rpcURL   string
	closer   jsonrpc.ClientCloser
}

func CreateLotusClient(rpcURl string) *LotusClientRPC {
	return &LotusClientRPC{rpcURL: rpcURl}
}

func (lc *LotusClientRPC) Connect() error {
	lotusAPI, closer, err := apiclient.NewFullNodeRPC(lc.rpcURL, http.Header{})
	if err != nil {
		log.WithError(err).Fatal("Failed to connect with Lotus Node")
		return err
	}

	lc.lotusAPI = lotusAPI
	lc.closer = closer

	return nil
}

func (lc *LotusClientRPC) Reconnect() error {
	lc.Disconnect()
	return lc.Connect()
}

func (lc *LotusClientRPC) Disconnect() {
	lc.closer()
}

func (lc *LotusClientRPC) LotusAPI() api.FullNode {
	return lc.lotusAPI
}
