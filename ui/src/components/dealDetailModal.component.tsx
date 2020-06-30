import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { ModalWrapper } from './modalWrapper.component'
import { DealTitles, DealValue, DealValueNotAvailable } from '../utils/types'
import { DealStatusIcon } from './dealStatusIcon.component'
import { truncateStringInTheMiddle } from '../utils/deals'
import { Button } from './button.component'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  deal: Maybe<DealValue>
}

const ModalTitle = styled.label`
  width: 84px;
  height: 33px;
  font-family: Poppins;
  font-size: 24px;
  font-weight: 600;
  line-height: 18px;
  text-align: left;
  color: #ffffff;
  margin-bottom: 22px;
`

const Footer = styled.div`
  margin: 30px auto 5px auto;
`
const Table = styled.table`
  border: none;
`

const TDTitle = styled.td`
  padding: 6px;
  opacity: 0.5;
  font-family: Poppins;
  font-size: 15px;
  line-height: 18px;
  text-align: left;
  color: #cfe0ff;
`
const TDValue = styled.td`
  padding: 6px;
  font-family: Poppins;
  font-size: 16px;
  font-weight: 500;
  line-height: 18px;
  text-align: right;
  color: #ffffff;
`

export const DealDetailModal = (props: Props) => {
  const { onClose, isOpen, deal } = props

  if (!deal) {
    return null
  }

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onClose}>
      <ModalTitle>Details</ModalTitle>
      <Table>
        <tbody>
          <tr>
            <TDTitle>{DealTitles.FileCID}</TDTitle>
            <TDValue title={deal.FileCID}>{truncateStringInTheMiddle(deal.FileCID, 6, 4)}</TDValue>
          </tr>

          <tr>
            <TDTitle>{DealTitles.DealID}</TDTitle>
            <TDValue>{deal.DealID}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.MinerID}</TDTitle>
            <TDValue>{deal.MinerID}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.Sector}</TDTitle>
            <TDValue>{deal.Sector}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.Client}</TDTitle>
            <TDValue>{deal.Client}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.PieceSize}</TDTitle>
            <TDValue>{deal.PieceSize}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.VerifiedDeal}</TDTitle>
            <TDValue>{deal.VerifiedDeal ? 'True' : 'False'}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.SealedCID}</TDTitle>
            <TDValue title={deal.SealedCID}>
              {deal.SealedCID !== DealValueNotAvailable
                ? truncateStringInTheMiddle(deal.SealedCID, 6, 4)
                : deal.SealedCID}
            </TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.StartEpoch}</TDTitle>
            <TDValue>{deal.StartEpoch}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.EndEpoch}</TDTitle>
            <TDValue>{deal.EndEpoch}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.Expiration}</TDTitle>
            <TDValue>{deal.Expiration}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.StoragePricePerEpoch}</TDTitle>
            <TDValue>{deal.StoragePricePerEpoch}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.ProviderCollateral}</TDTitle>
            <TDValue>{deal.ProviderCollateral}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.ClientCollateral}</TDTitle>
            <TDValue>{deal.ClientCollateral}</TDValue>
          </tr>
          <tr>
            <TDTitle>{DealTitles.State}</TDTitle>
            <TDValue className="is-right is-center">
              <DealStatusIcon status={deal.State} />
              {deal.State}
            </TDValue>
          </tr>
        </tbody>
      </Table>

      <Footer>
        <Button className="is-center" onClick={onClose}>
          Close
        </Button>
      </Footer>
    </ModalWrapper>
  )
}
