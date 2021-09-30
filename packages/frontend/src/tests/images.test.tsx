import React from 'react'
import { Router } from 'react-router-dom'
// eslint-disable-next-line
import { createMemoryHistory } from 'history'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { Close } from '../components/common/images/close.component'
import { Lens } from '../components/common/images/lens.component'
import { Logo } from '../components/common/images/logo.component'

describe('<Close /> spec', () => {
  it('renders the component', async () => {
    const { container } = render(<Close />)
    expect(container).toMatchSnapshot()
  })
})

describe('<Lens /> spec', () => {
  it('renders the component', async () => {
    const { container } = render(<Lens />)
    expect(container).toMatchSnapshot()
  })
})

describe('<Logo /> spec', () => {
  it('renders the component', async () => {
    const history = createMemoryHistory()

    const { container } = render(
      <Router history={history}>
        <Logo />{' '}
      </Router>,
    )
    expect(container).toMatchSnapshot()
  })
})
