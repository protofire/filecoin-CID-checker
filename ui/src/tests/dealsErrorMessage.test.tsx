import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { DealsErrorMessage } from '../components/dealsErrorMessage.component'

describe('<DealsErrorMessage /> spec', () => {
  it('renders the component', async () => {
    const { container } = render(<DealsErrorMessage />)
    expect(container).toMatchSnapshot()
  })
})
