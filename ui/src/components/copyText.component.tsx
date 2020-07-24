import React from 'react'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { Copy } from './common/images/copy.component'

interface Props {
  text: string
  className?: string
  title?: string
}

const CopyWrapper = styled.div`
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

const CopyImageWrapper = styled(Copy)`
  margin-top: 8px;
  margin-left: 8px;
`

export const CopyText = (props: Props) => {
  const { text, className, title = 'Click to copy' } = props

  return (
    <div onClick={(e: any) => e.stopPropagation()}>
      <CopyToClipboard onClick={(e: any) => e.stopPropagation()} text={text}>
        <CopyWrapper className={className} title={title}>
          <CopyImageWrapper />
        </CopyWrapper>
      </CopyToClipboard>
    </div>
  )
}
