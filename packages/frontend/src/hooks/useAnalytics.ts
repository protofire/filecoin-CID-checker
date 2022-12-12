import { useState, useEffect } from 'react'
import ReactGA from 'react-ga'
import { GA_TRASK_ID } from '../config/constants'

export function useAnalytics () {
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    if (GA_TRASK_ID && window.location.href.includes('filecoin.tools')) {
      ReactGA.initialize(GA_TRASK_ID)

      setInitialized(true)

      console.info('useAnalytics.initialized')
    }
  },[])

  return {
    initialized
  }
}