import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { Button } from '../components/button.component'

describe('<Button /> spec', () => {
  it('renders the component', async () => {
    const { container } = render(<Button />)
    expect(container).toMatchSnapshot()
  })
})
