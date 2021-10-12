import debug from 'debug'
import Pino from 'pino'

export function getLogger(feature: string): ReturnType<typeof debug> {
  return debug(`cid-checker-watcher:${feature}`)
}

export const prettyLogger = Pino({
  timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
  messageKey: 'message',
})
