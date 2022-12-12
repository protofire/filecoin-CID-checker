import React, { useEffect } from 'react'
import ReactGA from 'react-ga'
// import { useLocation } from 'react-router-dom'

interface AnanlyticsWrapperProps {
  initialized: boolean
  children: React.PropsWithChildren<any>
}

export function AnalyticsWrapper (props: AnanlyticsWrapperProps) {
  const { location } = window
  useEffect(() => {
    if (props.initialized && location) {
      ReactGA.pageview(location.pathname + location.search)
    }
  }, [props.initialized, location])

  return props.children
}