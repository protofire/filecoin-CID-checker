import React from 'react'
import styled from 'styled-components'

import { Logo } from '../../common/images/logo.component'
import { Search } from '../../search.component'
import { CheckboxFilter } from '../../checkboxFilter.component'

const LogoWrapper = styled.div`
  margin: 56px auto auto 48px;
`

const SearchWrapper = styled.div`
  margin: 44px auto auto auto;
`

const CheckboxFilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 10px 0 0 48px;
  max-width: 80px;
  height: 56px;
  text-decoration: none;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    align-items: center;
    margin: 48px 48px auto auto;
    max-width: none;
    padding-left: 20px;
  }
`

export const Header = () => {
  return (
    <div className="row">
      <LogoWrapper className="col">
        <Logo />
      </LogoWrapper>
      <SearchWrapper className="col">
        <Search />
      </SearchWrapper>
      <CheckboxFilterWrapper className="col">
        <CheckboxFilter></CheckboxFilter>
      </CheckboxFilterWrapper>
    </div>
  )
}
