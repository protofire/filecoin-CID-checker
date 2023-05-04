import { useState } from 'react'
import { useEffectOnce } from './useEffectOnce'
import { fetchDealStats } from '../utils/deals'

export const useStats = (): { stats: any } => {
  const [stats, setStats] = useState(null)

  useEffectOnce(() => {
    let ignore = false;

    async function startFetching() {
      const json = await fetchDealStats();
      if (!ignore) {
        setStats(json);
      }
    }

    startFetching();

    return () => {
      ignore = true;
    };
  });

  return {
    stats,
  }
}
