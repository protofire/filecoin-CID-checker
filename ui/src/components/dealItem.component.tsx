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
  top: 14px;
  margin-left: 2px;
`

const MinerSearch = styled.span`
  &:hover {
    color: #42c1ca;
  }
`
const TDFirst = styled(TD)`
  padding-left: 48px;
  width: 62%;
  @media (max-width: ${props => props.theme.themeBreakPoints.xxl}) {
    width: 62%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    width: 40%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    padding-left: 3px;
    width: 30%;
  }
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
  width: 10%;
  @media (max-width: ${props => props.theme.themeBreakPoints.xxl}) {
    width: 10%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    width: 15%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 20%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    & > div > span {
      display: none;
    }
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xs}) {
    & > div > span {
      display: none;
    }
  }
`

const TDThird = styled(TD)`
  width: 10%;
  @media (max-width: ${props => props.theme.themeBreakPoints.xxl}) {
    width: 10%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    width: 15%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
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

const TDFour = styled(TD)`
  width: 10%;
  @media (max-width: ${props => props.theme.themeBreakPoints.xxl}) {
    width: 10%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    width: 15%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 18%;
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
  width: 8%;
  @media (max-width: ${props => props.theme.themeBreakPoints.xxl}) {
    width: 8%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    width: 12%;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 18%;
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

const FileCidColumn = styled.span`
  @media (max-width: ${props => props.theme.themeBreakPoints.xxl}) {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 450px;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 200px;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100px;
  }
`

const CopyTextWrapperFileCid = styled(CopyTextWrapper)`
  @media (max-width: ${props => props.theme.themeBreakPoints.xxl}) {
    left: 495px;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    left: 245px;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    left: 100px;
  }
`

export const DealItem = (props: Props) => {
  const { setCurrentPage, setCurrentSearch } = useSearchContext()

  const { deal, onDoubleClick } = props

  const history = useHistory()

  const searchMiner = (minerId: string) => {
    setCurrentSearch(minerId)
    setCurrentPage(1)
    history.push(minerId)
  }

  return (
    <TR onDoubleClick={onDoubleClick} title="You can double click to open a deal">
      <TDFirst>
        <FileCidColumn title={deal.FileCID}>{deal.FileCID}</FileCidColumn>
        <CopyTextWrapperFileCid text={deal.FileCID} title="Click to copy Piece CID" />
      </TDFirst>
      <TDSecond>
        <div className="is-left is-center">
          <DealStatusIcon status={deal.State} />
          <span>{deal.State}</span>
        </div>
      </TDSecond>
      <TDThird>
        {deal.DealID}
        <CopyTextWrapper text={deal.DealID + ''} title="Click to copy Deal ID" />
      </TDThird>
      <TDFour>
        <MinerSearch
          onClick={() => searchMiner(deal.MinerID)}
          title="Click to search by this Miner ID"
        >
          {deal.MinerID}
        </MinerSearch>
        <CopyTextWrapper text={deal.MinerID} title="Click to copy Miner ID" />
      </TDFour>
      <TDFive className="text-center">{deal.Sector}</TDFive>
    </TR>
  )
}
