import React from 'react'
import { ThemeProvider } from 'styled-components'

import theme from './theme'
import { GlobalStyle } from './theme/global_style'
import { Main } from './components/main.component'
import { BackToTop } from './components/backToTop.component'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Main />
      <BackToTop />
    </ThemeProvider>
  )
}

export default App
