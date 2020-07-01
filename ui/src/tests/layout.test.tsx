import React from 'react'
import { Router } from 'react-router-dom'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
// eslint-disable-next-line
import { createMemoryHistory } from 'history'
import { ThemeProvider } from 'styled-components'

import { MainWrapper } from '../components/common/layout/mainWrapper.component'
import { Body } from '../components/common/layout/body.component'
import { Header } from '../components/common/layout/header.component'
import theme from '../theme'

describe('<MainWrapper /> spec', () => {
  it('renders the component', async () => {
    const { container } = render(<MainWrapper />)
    expect(container).toMatchSnapshot()
  })
})

describe('<Body /> spec', () => {
  it('renders the component', async () => {
    const { container } = render(<Body />)
    expect(container).toMatchSnapshot()
  })
})

describe('<Header /> spec', () => {
  it('renders the component', async () => {
    const history = createMemoryHistory()

    const { container } = render(
      <ThemeProvider theme={theme}>
        <Router history={history}>
          <Header />
        </Router>
      </ThemeProvider>,
    )
    expect(container).toMatchSnapshot()
  })
})
