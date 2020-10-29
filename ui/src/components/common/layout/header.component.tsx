import React from 'react'
import styled from 'styled-components'

import { Logo } from '../../common/images/logo.component'
import { Search } from '../../search.component'
import { Protofire } from '../../common/images/protofire.component'

const LogoWrapper = styled.div`
  margin: 56px auto auto 48px;
`

const SearchWrapper = styled.div`
  margin: 44px auto auto auto;
`

const ProtofireWrapper = styled.a`
  display: flex;
  flex-direction: column;
  margin: 10px 0 0 48px;
  max-width: 80px;
  text-decoration: none;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    align-items: flex-end;
    margin: 48px 48px auto auto;
    max-width: none;
    padding-left: 20px;
  }
`

const ProtofireWrapperInner = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Text = styled.span`
  color: #fff;
  display: block;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
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
      <ProtofireWrapper target="_blank" href="https://protofire.io/" className="col">
        <ProtofireWrapperInner>
          <Text>Built by</Text>
          <Protofire />
        </ProtofireWrapperInner>
      </ProtofireWrapper>
    </div>
  )
}
