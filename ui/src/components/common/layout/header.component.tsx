import React from 'react'
import styled from 'styled-components'

import { Logo } from '../../common/images/logo.component'
import { Search } from '../../search.component'

const SearchWrapper = styled.div`
  margin: 44px auto auto auto;
`

const LogoWrapper = styled.div`
  margin: 56px auto auto 48px;
`

export const Header = () => {
  return (
    <div className="row">
      <LogoWrapper className="col-3">
        <Logo />
      </LogoWrapper>
      <SearchWrapper className="col">
        <Search />
      </SearchWrapper>
    </div>
  )
}
