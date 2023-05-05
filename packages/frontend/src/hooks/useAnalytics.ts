import { useState } from 'react'
import { fetchGaTag } from '../utils/ga-tag'
import { useEffectOnce } from './useEffectOnce'

export function useAnalytics () {
  const [gaTagId, setGaTagId] = useState('')

  useEffectOnce(() => {
    const run = async () => {
      const gaTag = await fetchGaTag()

      if (gaTag && gaTag.gaTagId && gaTag.gaTagId !== '') {
        setGaTagId(gaTag.gaTagId)
      }
    }

    run()
  })

  return { gaTagId }
}