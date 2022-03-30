import {SLEEP_TIPSET_CHECK_MS} from './config'
import {prettyLogger} from './helpers/logger'
import {sleep} from './helpers/sleep'
import {runProcessorsWithChainHeadHeight} from './processors/runProcessors'

const NS = 'Run'

;(async () => {
    prettyLogger.info(`${NS} started`)
    /* eslint-disable */
    while (true) {
        try {
            await runProcessorsWithChainHeadHeight()
        } catch (error: any) {
            prettyLogger.warn(error, `${NS} error`)
        }
        prettyLogger.info(
            `${NS} Sleeping ${SLEEP_TIPSET_CHECK_MS / 1000} secs until next cycle`,
        )

        await sleep(SLEEP_TIPSET_CHECK_MS)
    }
    /* eslint-enable */
})()
