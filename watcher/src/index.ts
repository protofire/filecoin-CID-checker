import { SLEEP_TIPSET_CHECK_MS } from './config'
import { getLogger } from './helpers/logger'
import { sleep } from './helpers/sleep'
import { runProcessorsUptoChainHeadHeight } from './processors/runProcessors'

const logger = getLogger('index')

;(async () => {
  // eslint-disable-line
  while (true) {
    try {
      await sleep(SLEEP_TIPSET_CHECK_MS)
      await runProcessorsUptoChainHeadHeight()
    } catch (error) {
      logger('Something went wrong:')
      logger(error)
    }
  }
})()
