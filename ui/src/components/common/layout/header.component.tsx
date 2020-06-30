import React from 'react'
import { matchPath } from 'react-router-dom'
import styled from 'styled-components'

import { Logo } from '../../common/images/logo.component'
import { Search } from '../../search.component'

const SearchWrapper = styled.div`
  margin: 44px auto auto auto;
`

const LogoWrapper = styled.div`
  margin: 56px auto auto 48px;
`

const getParams = (pathname: string): { search?: string } => {
  const matchProfile = matchPath(pathname, {
    path: `/:search`,
    exact: true,
    strict: false,
  })
  return (matchProfile && matchProfile.params) || { search: '' }
}

export const Header = () => {
  // Params are defined by the Route, so they can't exist outside of that subtree like this component, implemented this hack
  const params = getParams(window.location.pathname)

  return (
    <div className="row">
      <LogoWrapper className="col-3">
        <Logo />
      </LogoWrapper>
      <SearchWrapper className="col">
        <Search search={params?.search || ''} />
      </SearchWrapper>
    </div>
  )
}
