import React from 'react'
import styled from 'styled-components'

import { Logo } from '../../common/images/logo.component'
import { SearchSingle } from '../../search-filter/search-filter.component'
import { NetworkSwitcher } from '../../networkSwitcher.component'

const LogoWrapper = styled.div`
  margin: 56px auto auto 48px;
  width: 20%;
`

const NetworkSwitcherWrapper = styled.div`
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

const SearchSingleWrapper = styled.div`
  margin: 44px auto auto auto;
  width: 100%;
`

export const Header = () => {
  return (
    <div className="row">
      <LogoWrapper className="col">
        <Logo />
      </LogoWrapper>
      <NetworkSwitcherWrapper className="col">
        <NetworkSwitcher />
      </NetworkSwitcherWrapper>
      <SearchSingleWrapper className="col">
        <SearchSingle />
      </SearchSingleWrapper>
    </div>
  )
}
