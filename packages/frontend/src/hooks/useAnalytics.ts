import { useState, useEffect } from 'react'
import { fetchGaTag } from '../utils/ga-tag'

export function useAnalytics () {
  const [gaTagId, setGaTagId] = useState('')

  useEffect(() => {
    const run = async () => {
      const gaTag = await fetchGaTag()

      if (gaTag && gaTag.gaTagId && gaTag.gaTagId !== '') {
        setGaTagId(gaTag.gaTagId)
      }
    }

    run()
  }, [])

  return { gaTagId }
}