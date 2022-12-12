import React from 'react'
import { ThemeProvider } from 'styled-components'

import theme from './theme'
import { GlobalStyle } from './theme/global_style'
import { Main } from './components/main.component'
import { BackToTop } from './components/backToTop.component'
import { GitHubCorners } from './components/gitHubCorners.component'
import { REPOSITORY_URL } from './config/constants'
import { AnalyticsWrapper } from './components/analytics-wrapper'
import { useAnalytics} from './hooks/useAnalytics'

function App() {
  const { initialized } = useAnalytics()

  return (
    <AnalyticsWrapper initialized={initialized}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <GitHubCorners url={REPOSITORY_URL} />
        <Main />
        <BackToTop />
      </ThemeProvider>
    </AnalyticsWrapper>
  )
}

export default App
