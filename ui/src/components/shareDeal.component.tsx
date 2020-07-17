import React from 'react'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { Share } from './common/images/share.component'

interface Props {
  text: string
  className?: string
  title?: string
}

const Span = styled.span`
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin: auto;
`

export const ShareDeal = (props: Props) => {
  const { text, className, title = 'Click to copy Deal link to share' } = props

  return (
    <CopyToClipboard text={`${window.location.origin}/deal/${text}`}>
      <Span className={className} title={title}>
        <Share />
      </Span>
    </CopyToClipboard>
  )
}
