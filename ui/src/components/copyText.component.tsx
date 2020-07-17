import React from 'react'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { Copy } from './common/images/copy.component'

interface Props {
  text: string
  className?: string
  title?: string
}

const Span = styled.span`
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin: auto;
`

export const CopyText = (props: Props) => {
  const { text, className, title = 'Click to copy' } = props

  return (
    <CopyToClipboard text={text}>
      <Span className={className} title={title}>
        <Copy />
      </Span>
    </CopyToClipboard>
  )
}
