import { useState, useEffect } from 'react'
import ReactGA from 'react-ga'
import { GA_TRACKER_ID } from '../config/constants'

export function useAnalytics () {
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    if (GA_TRACKER_ID && window.location.href.includes('filecoin.tools')) {
      ReactGA.initialize(GA_TRACKER_ID)

      setInitialized(true)

      console.info('useAnalytics.initialized')
    }
  },[])

  return {
    initialized
  }
}