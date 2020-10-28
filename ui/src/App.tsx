import React from 'react'
import { ThemeProvider } from 'styled-components'

import theme from './theme'
import { GlobalStyle } from './theme/global_style'
import { Main } from './components/main.component'
import { BackToTop } from './components/backToTop.component'
import { GitHubCorners } from './components/gitHubCorners.component'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <GitHubCorners />
      <Main />
      <BackToTop />
    </ThemeProvider>
  )
}

export default App
