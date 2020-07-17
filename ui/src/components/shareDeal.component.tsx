import React from 'react'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { Share } from './common/images/share.component'

interface Props {
  text: string
  className?: string
  title?: string
}

const ShareWrapper = styled.div`
  display: inline-block;
  width: 32px;
  height: 32px;
  border-radius: 24px;
  cursor: pointer;
  &:hover {
    background-color: rgb(207, 224, 255, 0.1);
  }
  &:active,
  &:focus-within {
    background-color: rgb(207, 224, 255, 0.2);
  }
`

const ShareImageWrapper = styled(Share)`
  margin-top: 7px;
  margin-left: 7px;
`

export const ShareDeal = (props: Props) => {
  const { text, className, title = 'Click to copy Deal link to share' } = props

  return (
    <CopyToClipboard text={`${window.location.origin}/deal/${text}`}>
      <ShareWrapper className={className} title={title}>
        <ShareImageWrapper />
      </ShareWrapper>
    </CopyToClipboard>
  )
}
