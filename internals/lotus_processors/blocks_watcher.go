package lotus_processors

import (
	"context"
	"time"

	"github.com/filecoin-project/lotus/api"
	"github.com/filecoin-project/specs-actors/actors/abi"
	log "github.com/sirupsen/logrus"
)

type BlocksWatcher struct {
	lotusApi          api.FullNode
	height            abi.ChainEpoch
	blockEventHandles []BlockEventHandler
}

func NewBlocksWatcher(lotusApi api.FullNode) *BlocksWatcher {
	return &BlocksWatcher{lotusApi: lotusApi}
}

func (w *BlocksWatcher) Start() {
	go func() {
		for {
			ts, err := w.lotusApi.ChainHead(context.Background())
			if err != nil {
				log.WithError(err).Error("Failed to get ChainHead from Lotus API")
				time.Sleep(5 * time.Second)
				continue
			}

			if ts.Height() > w.height {
				w.height = ts.Height()
				log.WithField("height", w.height).Info("New block height")

				var gotError bool
				for _, handler := range w.blockEventHandles {
					if err := handler(); err != nil {
						log.WithError(err).Error("Failed to handle BlockEvent")
						gotError = true
						break
					}
				}
				if gotError {
					time.Sleep(5 * time.Second)
					continue
				}
			}

			time.Sleep(time.Second)
		}
	}()
}

type BlockEventHandler func() error

func (w *BlocksWatcher) AddBlockEventHandler(handler BlockEventHandler) *BlocksWatcher {
	w.blockEventHandles = append(w.blockEventHandles, handler)
	return w
}
