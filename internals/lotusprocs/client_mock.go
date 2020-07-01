package lotusprocs

import (
	"github.com/filecoin-project/lotus/api"
)

type LotusClientMock struct {
	lotusAPI api.FullNode
}

func CreateLotusClientMock(lotusAPI api.FullNode) *LotusClientMock {
	return &LotusClientMock{lotusAPI: lotusAPI}
}

func (lc *LotusClientMock) Connect() error {
	return nil
}

func (lc *LotusClientMock) Reconnect() error {
	return nil
}

func (lc *LotusClientMock) Disconnect() {
}

func (lc *LotusClientMock) LotusAPI() api.FullNode {
	return lc.lotusAPI
}
