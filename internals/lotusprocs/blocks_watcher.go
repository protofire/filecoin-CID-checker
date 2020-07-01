package lotusprocs

import (
	"context"
	"time"

	"github.com/filecoin-project/specs-actors/actors/abi"
	log "github.com/sirupsen/logrus"
)

// BlocksWatcher responsible for watching new blocks and run blockEventHandlers.
type BlocksWatcher struct {
	lotusClient        LotusClient
	height             abi.ChainEpoch
	blockEventHandlers []BlockEventHandler
}

// NewBlocksWatcher create new BlocksWatcher instance.
func NewBlocksWatcher(lotusClient LotusClient) *BlocksWatcher {
	return &BlocksWatcher{lotusClient: lotusClient}
}

// Start runs in infinite cycle and triggers handlers from blockEventHandlers each new block.
func (w *BlocksWatcher) Start() {
	go func() {
		for {
			ts, err := w.lotusClient.LotusAPI().ChainHead(context.Background())
			if err != nil {
				log.WithError(err).Error("Failed to get ChainHead from Lotus")

				err := w.lotusClient.Reconnect()
				if err != nil {
					log.WithError(err).Error("Failed to reconnect with Lotus")
				}

				time.Sleep(5 * time.Second)

				continue
			}

			if ts.Height() > w.height {
				w.height = ts.Height()
				log.WithField("height", w.height).Info("New block height")

				var gotError bool
				for _, handler := range w.blockEventHandlers {
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

// BlockEventHandler handler type for new block event.
type BlockEventHandler func() error

// AddBlockEventHandler attaches new handler to handlers pools.
func (w *BlocksWatcher) AddBlockEventHandler(handler BlockEventHandler) *BlocksWatcher {
	w.blockEventHandlers = append(w.blockEventHandlers, handler)
	return w
}
