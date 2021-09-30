import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { NoDealsAvailableMessage } from '../components/noDealsAvailableMessage.component'

describe('<NoDealsAvailableMessage /> spec', () => {
  it('renders the component', async () => {
    const { container } = render(<NoDealsAvailableMessage />)
    expect(container).toMatchSnapshot()
  })
})
