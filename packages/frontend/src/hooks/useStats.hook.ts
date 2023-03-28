import { useEffect, useState } from 'react'

import { fetchDealStats } from '../utils/deals'

export const useStats = (): { stats: any } => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        if (!stats) {
          const newstats = await fetchDealStats()
          setStats(newstats)
        }
        console.info('stats', stats)
      } catch (e) {
        /* eslint-disable no-console*/
        console.error('useStats', e)
        /* eslint-enable no-console*/
      }
    }
    run()
    return () => {  }
  }, [stats])

  return {
    stats,
  }
}
