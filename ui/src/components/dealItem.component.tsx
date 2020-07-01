import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { DealValue } from '../utils/types'
import { DealStatusIcon } from './dealStatusIcon.component'

interface Props extends HTMLAttributes<HTMLDivElement> {
  deal: DealValue
  key: number
  onClick: () => void
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

export const DealItem = (props: Props) => {
  const { deal, onClick } = props
  return (
    <TR onClick={onClick}>
      <td style={{ paddingLeft: '48px' }}>{deal.FileCID}</td>
      <td>{deal.DealID}</td>
      <td>{deal.MinerID}</td>
      <td>{deal.Sector}</td>
      <td>
        <div className="is-left is-center">
          <DealStatusIcon status={deal.State} />
          {deal.State}
        </div>
      </td>
    </TR>
  )
}
