import React from 'react'
import styled, { css } from 'styled-components'

import { DealStatus } from '../utils/types'

export interface DealStatusProps {
  status: DealStatus
}

const StatusActiveCSS = css`
  width: 8px;
  height: 8px;
  border-radius: 32px;
  background-color: #3db14a;
`

const StatusFaultCSS = css`
  width: 8px;
  height: 8px;
  border-radius: 32px;
  background-color: #d6c41e;
`

const StatusRecoveryCSS = css`
  width: 8px;
  height: 8px;
  border-radius: 32px;
  background-color: #8894a8;
`

const StatusUnknowCSS = css`
  width: 8px;
  height: 8px;
  border-radius: 32px;
  background-color: #8a8a8a;
`

const getStatusTypeStyles = (status: DealStatus = DealStatus.Unknown): any => {
  if (status === DealStatus.Active) {
    return StatusActiveCSS
  }

  if (status === DealStatus.Fault) {
    return StatusFaultCSS
  }

  if (status === DealStatus.Recovery) {
    return StatusRecoveryCSS
  }

  if (status === DealStatus.Unknown) {
    return StatusUnknowCSS
  }

  return StatusUnknowCSS
}

const DealStatusCSS = css<DealStatusProps>`
  ${props => getStatusTypeStyles(props.status)}
`

const Wrapper = styled.div<DealStatusProps>`
  ${DealStatusCSS}
  margin-right: 10px;
`

export const DealStatusIcon = (props: DealStatusProps) => {
  return <Wrapper status={props.status} />
}
