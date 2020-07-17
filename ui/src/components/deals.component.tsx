import React, { useEffect } from 'react'
import Loader from 'react-loader-spinner'
import styled from 'styled-components'
import { Waypoint } from 'react-waypoint'
import { useParams } from 'react-router-dom'

import { useDeals } from '../hooks/useDeals.hook'
import { RemoteData } from '../utils/remoteData'
import { NoDealsAvailableMessage } from './noDealsAvailableMessage.component'
import { DealsErrorMessage } from './dealsErrorMessage.component'
import { DealsList } from './dealsList.component'
import { DealTitles } from '../utils/types'
import { Button } from './button.component'
import { useSearchContext } from '../state/search.context'

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
const ShowMoreButton = styled(Button)`
  margin: 20px auto 20px auto;
`

export const Deals = () => {
  const { search, page, setCurrentPage, setCurrentSearch } = useSearchContext()

  const { search: searchFromParams, deal: dealIdFromParams } = useParams()

  useEffect(() => {
    if (searchFromParams) {
      setCurrentSearch(searchFromParams)
    }
  }, [setCurrentSearch, searchFromParams])

  useEffect(() => {
    if (dealIdFromParams) {
      setCurrentSearch(dealIdFromParams)
    }
  }, [setCurrentSearch, dealIdFromParams])

  const { deals } = useDeals(search, page)

  const showMore = () => {
    setCurrentPage(page + 1)
  }

  const showMoreButton = !search && !RemoteData.is.loading(deals) && (
    <div className="row is-center">
      <ShowMoreButton
        className="is-center"
        disabled={RemoteData.is.reloading(deals)}
        onClick={showMore}
      >
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
              <DealsList deals={deals} openModal={!!dealIdFromParams} />
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
          <BlockWrapper className="col is-center" data-testid="loading">
            <Loader visible={true} type="ThreeDots" color="#42C1CA" height={50} width={50} />
          </BlockWrapper>
        )}
      </div>
      {!search && RemoteData.is.success(deals) && <Waypoint onEnter={showMore} />}
    </>
  )
}
