import { SLEEP_TIPSET_CHECK_MS } from './config'
import { getLogger } from './helpers/logger'
import { sleep } from './helpers/sleep'
import { runProcessorsWithChainHeadHeight } from './processors/runProcessors'

const logger = getLogger('index')

;(async () => {
  // eslint-disable-line
  while (true) {
    try {
      await runProcessorsWithChainHeadHeight()
    } catch (error) {
      logger('Something went wrong:')
      logger(error)
    }
    logger(`Sleeping ${SLEEP_TIPSET_CHECK_MS / 1000} secs until next cycle`)
    await sleep(SLEEP_TIPSET_CHECK_MS)
  }
})()
