import React, { useEffect, useState, useCallback } from 'react'
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
import { DownArrowFilledIcon } from './common/icons'
import { useStats } from '../hooks/useStats.hook'
import prettyBytes from 'pretty-bytes'
import { getDealsCsvUrl } from '../utils/deals'
import { PAGE_SIZE } from '../config/constants'

interface ParamTypes {
  deal: string
  search: string
}

const BlockWrapper = styled.div`
  padding: 120px;
`

const Table = styled.table`
  table-layout: fixed;
  width: 100%;
`

const TH = styled.th`
  font-family: Poppins;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  text-align: left;
  color: #cfe0ff;
  text-transform: uppercase;
`

const StatValue = styled.th`
  font-family: Poppins;
  font-size: 16px;
  font-weight: 800;
  line-height: 18px;
  text-align: left;
  color: #cfe0ff;
  text-transform: uppercase;
`

const THead = styled.thead`
  border-bottom: none;
`

const THFirst = styled(TH)`
  width: 35%;
  @media (max-width: ${(props) => props.theme.themeBreakPoints.xs}) {
    width: 20%;
  }
`
const THSecond = styled(TH)`
  @media (max-width: ${(props) => props.theme.themeBreakPoints.lg}) {
    width: 30px;
    visibility: hidden;
  }
`
const THThird = styled(TH)``
const THFourth = styled(TH)``
const THFive = styled(TH)`
  width: 35%;
  text-align: right;
  @media (max-width: ${(props) => props.theme.themeBreakPoints.md}) {
    padding-left: 0px;
    width: 20%;
  }
`

const THButton = styled.button`
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  align-items: center;
  font: inherit;
  color: inherit;
  outline: none;
  background-color: rgba(0, 0, 0, 0);
`

const ShowMoreButton = styled(Button)`
  margin: 20px auto 20px auto;
`

export const Deals = () => {
  const {
    search,
    page,
    query,
    activeFilter,
    verifiedFilter,
    setCurrentPage,
    setCurrentSearch,
    setCurrentQuery,
  } = useSearchContext()
  const { search: searchFromParams, deal: dealIdFromParams } = useParams<ParamTypes>()

  const [order, setOrder] = useState<'asc' | 'desc' | undefined>()

  function setQuery(sort?: string, order?: number) {
    if (sort === 'status' && order) {
      setCurrentQuery(`&sort_by_column=status&sort_direction=${order}`)
    } else {
      setCurrentQuery('')
    }
  }

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

  const { deals, moreDeals } = useDeals(search, page, query, activeFilter, verifiedFilter)
  const { stats } = useStats()

  const showMore = () => {
    setCurrentPage(page + 1)
  }

  function onStateClick() {
    setCurrentPage(1)

    if (!order || order === 'asc') {
      setOrder('desc')
      setQuery('status', -1)
    } else if (order === 'desc') {
      setOrder('asc')
      setQuery('status', 1)
    }
  }

  function onDealIdClick() {
    setOrder(undefined)
    setCurrentPage(1)
    setQuery()
  }

  const encodedSearch = encodeURIComponent(search)

  const handleCsvDownload = useCallback(async () => {
    const url = await getDealsCsvUrl(
      encodedSearch,
      query,
      activeFilter,
      verifiedFilter,
      page * PAGE_SIZE,
    )
    window.open(url, '_blank')

  }, [encodedSearch, page, query, activeFilter, verifiedFilter])

  const showMoreButton =
    moreDeals && !RemoteData.is.loading(deals) ? (
      <div className="row is-center">
        <ShowMoreButton
          className="is-center"
          disabled={RemoteData.is.reloading(deals)}
          onClick={showMore}
        >
          {RemoteData.is.reloading(deals) ? 'Loading...' : 'Show more'}
        </ShowMoreButton>
      </div>
    ) : null

  return (
    <>
      <div className="container" style={{ marginBottom: '40px' }}>
        <Button onClick={handleCsvDownload} width="auto">
          Download as CSV
        </Button>
        {RemoteData.hasData(deals) && deals.data.length > 0 && (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>TOTAL UNIQUE CIDS</TH>
                  <TH>TOTAL UNIQUE PROVIDERS</TH>
                  <TH>TOTAL UNIQUE CLIENTS</TH>
                  <TH>TOTAL STORAGE DEALS</TH>
                  <TH>TOTAL DATA STORED</TH>
                  <TH>LATEST HEIGHT</TH>
                </tr>
              </THead>
              <tbody>
                <tr>
                  <StatValue>{stats?.numberOfUniqueCIDs}</StatValue>
                  <StatValue>{stats?.numberOfUniqueProviders}</StatValue>
                  <StatValue>{stats?.numberOfUniqueClients}</StatValue>
                  <StatValue>{stats?.totalDeals}</StatValue>
                  <StatValue>
                    {stats && stats.totalDealSize ? prettyBytes(stats.totalDealSize) : null}
                  </StatValue>
                  <StatValue>{stats?.latestHeight}</StatValue>
                </tr>
              </tbody>
            </Table>
            <br />
            <Table>
              <THead>
                <tr>
                  <THFirst>{DealTitles.PieceCID}</THFirst>
                  <THSecond>
                    <THButton onClick={onStateClick}>
                      {DealTitles.State}
                      <DownArrowFilledIcon
                        style={{
                          transform: query && order === 'asc' ? 'rotate(180deg)' : 'none',
                          opacity: query ? 1 : 0.2,
                        }}
                      />
                    </THButton>
                  </THSecond>
                  <THThird>
                    <THButton onClick={onDealIdClick}>
                      {DealTitles.DealID}
                      <DownArrowFilledIcon style={{ opacity: query ? 0.2 : 1 }} />
                    </THButton>
                  </THThird>
                  <THFourth>{DealTitles.MinerID}</THFourth>
                  <THFive>{DealTitles.PayloadCID}</THFive>
                </tr>
              </THead>
              <tbody>
                <DealsList deals={deals} openModal={!!dealIdFromParams} />
              </tbody>
            </Table>
            {showMoreButton}
          </>
        )}
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
        {RemoteData.is.success(deals) && moreDeals && <Waypoint onEnter={showMore} />}
      </div>
    </>
  )
}
