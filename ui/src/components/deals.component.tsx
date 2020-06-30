import React, { HTMLAttributes, useState } from 'react'
import Loader from 'react-loader-spinner'
import styled from 'styled-components'
import { Waypoint } from 'react-waypoint'

import { useDeals } from '../hooks/useDeals.hook'
import { RemoteData } from '../utils/remoteData'
import { NoDealsAvailableMessage } from './noDealsAvailableMessage.component'
import { DealsErrorMessage } from './dealsErrorMessage.component'
import { DealsList } from './dealsList.component'
import { DealTitles } from '../utils/types'

interface Props extends HTMLAttributes<HTMLDivElement> {
  search: string
}

const TH = styled.th`
  font-family: Poppins;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  text-align: left;
  color: #cfe0ff;
  text-transform: uppercase;
`

const BlockWrapper = styled.div`
  padding: 120px;
`
const THead = styled.thead`
  border-bottom: none;
`
const ShowMoreButton = styled.button`
  margin: 20px auto 20px auto;
  width: 212px;
  height: 56px;
  border-radius: 28px;
  background-color: #42c1ca;
`

export const Deals = (props: Props) => {
  const { search } = props

  const [page, setPage] = useState(1)

  const { deals } = useDeals(search, page)
  const showMore = () => {
    setPage(page => page + 1)
  }

  const showMoreButton = !search && !RemoteData.is.loading(deals) && (
    <div className="row is-center">
      <ShowMoreButton disabled={RemoteData.is.reloading(deals)} onClick={showMore}>
        {RemoteData.is.reloading(deals) ? 'Loading...' : 'Show more'}
      </ShowMoreButton>
    </div>
  )

  return (
    <>
      {RemoteData.hasData(deals) && deals.data.length > 0 && (
        <>
          <table>
            <THead>
              <tr>
                <TH style={{ paddingLeft: '48px' }}>{DealTitles.FileCID}</TH>
                <TH>{DealTitles.DealID}</TH>
                <TH>{DealTitles.MinerID}</TH>
                <TH>{DealTitles.Sector}</TH>
                <TH>{DealTitles.State}</TH>
              </tr>
            </THead>
            <tbody>
              <DealsList deals={deals} />
            </tbody>
          </table>
          {showMoreButton}
        </>
      )}
      <div className="container">
        {RemoteData.is.success(deals) && deals.data.length === 0 && (
          <BlockWrapper className="col is-center">
            <NoDealsAvailableMessage />
          </BlockWrapper>
        )}
        {RemoteData.is.failure(deals) && (
          <BlockWrapper className="col is-center">
            <DealsErrorMessage />
          </BlockWrapper>
        )}
        {RemoteData.is.loading(deals) && (
          <BlockWrapper className="col is-center">
            <Loader visible={true} type="ThreeDots" color="#42C1CA" height={50} width={50} />
          </BlockWrapper>
        )}
      </div>
      {!search && RemoteData.is.success(deals) && <Waypoint onEnter={showMore} />}
    </>
  )
}
