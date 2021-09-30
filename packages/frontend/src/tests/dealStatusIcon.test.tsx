import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { DealStatusIcon } from '../components/dealStatusIcon.component'
import { DealStatus } from '../utils/types'

describe('<DealStatusIcon /> Active', () => {
  it('renders the component', async () => {
    const { container } = render(<DealStatusIcon status={DealStatus.Active} />)

    const headerClass = DealStatusIcon({ status: DealStatus.Active }).type.styledComponentId
    const MyHeaderRoots = document.getElementsByClassName(headerClass)
    const style = window.getComputedStyle(MyHeaderRoots[0])

    expect(style.backgroundColor).toBe('rgb(61, 177, 74)')
    expect(container).toMatchSnapshot()
  })
})

describe('<DealStatusIcon /> Fail', () => {
  it('renders the component', async () => {
    const { container } = render(<DealStatusIcon status={DealStatus.Fault} />)

    const headerClass = DealStatusIcon({ status: DealStatus.Fault }).type.styledComponentId
    const MyHeaderRoots = document.getElementsByClassName(headerClass)
    const style = window.getComputedStyle(MyHeaderRoots[0])

    expect(style.backgroundColor).toBe('rgb(214, 196, 30)')
    expect(container).toMatchSnapshot()
  })
})

describe('<DealStatusIcon /> Active', () => {
  it('renders the component', async () => {
    const { container } = render(<DealStatusIcon status={DealStatus.Recovery} />)

    const headerClass = DealStatusIcon({ status: DealStatus.Fault }).type.styledComponentId
    const MyHeaderRoots = document.getElementsByClassName(headerClass)
    const style = window.getComputedStyle(MyHeaderRoots[0])

    expect(style.backgroundColor).toBe('rgb(136, 148, 168)')

    expect(container).toMatchSnapshot()
  })
})

describe('<DealStatusIcon /> Active', () => {
  it('renders the component', async () => {
    const { container } = render(<DealStatusIcon status={DealStatus.Unknown} />)

    const headerClass = DealStatusIcon({ status: DealStatus.Fault }).type.styledComponentId
    const MyHeaderRoots = document.getElementsByClassName(headerClass)
    const style = window.getComputedStyle(MyHeaderRoots[0])

    expect(style.backgroundColor).toBe('rgb(240, 41, 26)')

    expect(container).toMatchSnapshot()
  })
})
