import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { DealValue } from '../utils/types'
import { DealStatusIcon } from './dealStatusIcon.component'
import { CopyText } from './copyText.component'

interface Props extends HTMLAttributes<HTMLDivElement> {
  deal: DealValue
  key: number
  onDoubleClick: () => void
}

const TR = styled.tr`
  background-color: rgb(207, 224, 255, 0.1);
  height: 63px;
  cursor: pointer;
  font-family: Poppins;
  font-size: 16px;
  line-height: 18px;
  text-align: left;
  color: #cfe0ff;
  &:hover {
    background-color: rgb(171, 201, 255, 0.2);
    color: #ffffff;
  }
  background-image: linear-gradient(to right, #0a111e, #1a283e);
  background-repeat: no-repeat;
  background-position: left bottom;
  background-size: 100% 1px;
`

const TD = styled.td`
  position: relative;
`

const CopyTextWrapper = styled(CopyText)`
  position: absolute;
  margin-left: 4px;
`

export const DealItem = (props: Props) => {
  const { deal, onDoubleClick } = props
  return (
    <TR onDoubleClick={onDoubleClick} title="You can double click to open a deal">
      <TD style={{ paddingLeft: '48px' }}>
        {deal.FileCID}
        <CopyTextWrapper text={deal.FileCID} title="Click to copy Piece CID" />
      </TD>
      <TD style={{ width: '9%' }}>
        {deal.DealID}
        <CopyTextWrapper text={deal.DealID + ''} title="Click to copy Deal ID" />
      </TD>
      <TD style={{ width: '11%' }}>
        {deal.MinerID}
        <CopyTextWrapper text={deal.MinerID} title="Click to copy Miner ID" />
      </TD>
      <td style={{ width: '8%' }}>{deal.Sector}</td>
      <td style={{ width: '10%' }}>
        <div className="is-left is-center">
          <DealStatusIcon status={deal.State} />
          {deal.State}
        </div>
      </td>
    </TR>
  )
}
