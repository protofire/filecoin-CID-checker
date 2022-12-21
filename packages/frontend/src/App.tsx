import React from 'react'
import { ThemeProvider } from 'styled-components'

import theme from './theme'
import { GlobalStyle } from './theme/global_style'
import { Main } from './components/main.component'
import { BackToTop } from './components/backToTop.component'
import { GitHubCorners } from './components/gitHubCorners.component'
import { REPOSITORY_URL } from './config/constants'
import { useAnalytics} from './hooks/useAnalytics'
import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'

function AppChild () {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <GitHubCorners url={REPOSITORY_URL} />
      <Main />
      <BackToTop />
    </ThemeProvider>
  )
}
function App() {
  const { gaTagId } = useAnalytics()

  console.info('gaTagId', gaTagId)
  if (gaTagId) {
    const gtmParams = { id: gaTagId }

    return (
      <GTMProvider state={gtmParams}>
        <AppChild />
      </GTMProvider>
    )
  }
  return (
    <><AppChild /></>
  )
}

export default App
