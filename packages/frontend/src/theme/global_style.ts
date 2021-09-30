import { createGlobalStyle } from 'styled-components'

import theme from './'

type ThemeType = typeof theme

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  html body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;

    background-image: linear-gradient(to right, ${props =>
      props.theme.colors.mainBodyBackgroundLeft}, ${props =>
  props.theme.colors.mainBodyBackgroundRight});
    font-family: ${props => props.theme.fonts.fontFamily};
    font-size: ${props => props.theme.fonts.defaultSize};
  }

  code {
    font-family: ${props => props.theme.fonts.fontFamilyCode};
  }

  body,
  html,
  #root {
    height: 100vh;
    width: 100%;
  }
`
