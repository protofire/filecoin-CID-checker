import React from 'react'
import styled from 'styled-components'
import { GitHubCorners } from '../../gitHubCorners.component'
import { ProtofireLink } from '../../protofireLink.component'

const Scroll = styled.div`
  overflow: hidden;
  position: relative;
`

export const MainWrapper: React.FC = props => {
  const { children, ...restProps } = props

  return (
    <Scroll>
      <GitHubCorners />
      <ProtofireLink />
      <div className="container" {...restProps}>
        {children}
      </div>
    </Scroll>
  )
}
