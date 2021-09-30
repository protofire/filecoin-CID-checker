import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'

import { DealValue } from '../utils/types'
import { DealStatusIcon } from './dealStatusIcon.component'
import { CopyText } from './copyText.component'
import { useSearchContext } from '../state/search.context'

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

const TD = styled.td`
  position: relative;
`

const CopyTextWrapper = styled(CopyText)`
  position: absolute;
  top: 14px;
`

const MinerSearch = styled.span`
  padding-left: 35px;
  &:hover {
    color: #42c1ca;
  }
`
const TDFirst = styled(TD)`
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    padding-left: 3px;
    & > div {
      display: none;
    }
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xs}) {
    padding-left: 3px;
    & > div {
      display: none;
    }
  }
`

const TDSecond = styled(TD)`
  @media (max-width: ${props => props.theme.themeBreakPoints.lg}) {
    & > div > span {
      display: none;
    }
  }
`

const TDThird = styled(TD)`
  @media (max-width: ${props => props.theme.themeBreakPoints.lg}) {
    width: 20%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    & > div {
      display: none;
    }
  }
`

const TDFour = styled(TD)`
  @media (max-width: ${props => props.theme.themeBreakPoints.lg}) {
    width: 20%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    & > div {
      display: none;
    }
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xs}) {
    & > div {
      display: none;
    }
  }
`

const TDFive = styled(TD)`
  width: 35%;
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    & > div {
      display: none;
    }
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xs}) {
    & > div {
      display: none;
    }
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    padding-left: 0px;
    width: 25%;
  }
`

const FileCidColumn = styled.span`
  padding-left: 35px;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`
const Span = styled.span`
  padding-left: 35px;
`

export const DealItem = (props: Props) => {
  const { setCurrentPage, setCurrentSearch } = useSearchContext()

  const { deal, onClick } = props

  const history = useHistory()

  const searchMiner = (minerId: string) => {
    setCurrentSearch(minerId)
    setCurrentPage(1)
    history.push(minerId)
  }

  return (
    <TR onClick={onClick} title="Click to see the deal's details">
      <TDFirst>
        <CopyTextWrapper text={deal.PieceCID} title="Click to copy Piece CID" />
        <FileCidColumn title={deal.PieceCID}>{deal.PieceCID}</FileCidColumn>
      </TDFirst>
      <TDSecond>
        <div className="is-left is-center">
          <DealStatusIcon status={deal.State} />
          <span>{deal.State}</span>
        </div>
      </TDSecond>
      <TDThird>
        <CopyTextWrapper text={deal.DealID + ''} title="Click to copy Deal ID" />
        <Span>{deal.DealID}</Span>
      </TDThird>
      <TDFour>
        <CopyTextWrapper text={deal.MinerID} title="Click to copy Miner ID" />
        <MinerSearch
          onClick={() => searchMiner(deal.MinerID)}
          title="Click to search by this Miner ID"
        >
          {deal.MinerID}
        </MinerSearch>
      </TDFour>
      <TDFive>
        <CopyTextWrapper text={deal.Label} title="Click to copy Payload CID" />
        <FileCidColumn title={deal.Label}>{deal.Label}</FileCidColumn>
      </TDFive>
    </TR>
  )
}
