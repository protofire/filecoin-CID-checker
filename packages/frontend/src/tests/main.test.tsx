import React from 'react'
import { Router } from 'react-router-dom'
// eslint-disable-next-line
import { createMemoryHistory } from 'history'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { ThemeProvider } from 'styled-components'
import { Main } from '../components/main.component'
import theme from '../theme'

describe('<Main /> spec', () => {
  it('renders the component', async () => {
    const history = createMemoryHistory()
    const { container, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Router history={history}>
          <Main />
        </Router>
      </ThemeProvider>,
    )

    expect(container.innerHTML).toMatch(/Search by Piece CID, Deal ID, or Miner ID/i)

    const loading = getByTestId('loading')
    expect(loading).toBeInTheDocument()
  })
})
