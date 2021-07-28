import { useEffect, useState } from 'react'

import { fetchDealStats } from '../utils/deals'

export const useStats = (): { stats: any } => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        console.log('stats', stats)
        if (!stats) {
          const newstats = await fetchDealStats()
          setStats(newstats)
        }
      } catch (e) {
        console.error(e)
      }
    }

    run()
  }, [stats])

  return {
    stats,
  }
}
