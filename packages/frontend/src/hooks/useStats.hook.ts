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
      } catch (e) {
        /* eslint-disable no-console*/
        console.error('useStats', e)
        /* eslint-enable no-console*/
      }
    }

    run()
  }, [stats])

  return {
    stats,
  }
}
