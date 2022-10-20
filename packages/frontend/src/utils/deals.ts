import { FILECOIN_CID_CHECKER_API, PAGE_SIZE } from '../config/constants'
import { DealDetails, DealStatus, DealValue, DealValueNotAvailable } from './types'

export const truncateStringInTheMiddle = (
  str: string,
  strPositionStart: number,
  strPositionEnd: number,
) => {
  const minTruncatedLength = strPositionStart + strPositionEnd
  try {
    if (minTruncatedLength < str.length) {
      return `${str.substr(0, strPositionStart)}...${str.substr(
        str.length - strPositionEnd,
        str.length,
      )}`
    }
    return str
  } catch (e) {
    /* eslint-disable no-console*/
    console.error('truncateStringInTheMiddle', e)
    /* eslint-enable no-console*/
  }
}

export const fetchDeals = async (
  search: string,
  page: number,
  query: string,
  activeFilter: boolean,
  verifiedFilter: boolean,
): Promise<DealValue[]> => {
  let url = `${FILECOIN_CID_CHECKER_API}/deals/list?page=${page}&per_page=${PAGE_SIZE}`

  if (search) {
    url = url + `&selector=${search}`
  }

  if (activeFilter) {
    url = url + '&activeDeal=1'
  }

  if (verifiedFilter) {
    url = url + '&verifiedDeal=1'
  }

  url = url + query
  const response = await fetch(url)
  const data = await response.json()

  const deals = data?.Deals ?? []

  const formattedDeals: DealValue[] = deals.map((deal: any) => {
    const { DealInfo } = deal

    const {
      PieceCID,
      Provider: MinerID,
      Client,
      PieceSize,
      VerifiedDeal,
      StartEpoch,
      EndEpoch,
      StoragePricePerEpoch,
      ProviderCollateral,
      ClientCollateral,
      Label,
      StartEpochAsDate,
      EndEpochAsDate,
    } = DealInfo?.Proposal
    const DealID = DealInfo?.DealID || DealValueNotAvailable
    const State = DealInfo.State.SectorStartEpoch > -1 ? DealStatus.Active : DealStatus.Unknown

    return {
      PieceCID: PieceCID['/'],
      DealID,
      MinerID,
      Client,
      PieceSize,
      VerifiedDeal,
      StartEpoch,
      EndEpoch,
      StartEpochAsDate,
      EndEpochAsDate,
      StoragePricePerEpoch,
      ProviderCollateral,
      ClientCollateral,
      State,
      Label,
    }
  })

  return formattedDeals
}

export const fetchDealDetails = async (dealId: string): Promise<DealDetails> => {
  const url = `${FILECOIN_CID_CHECKER_API}/deals/details/${dealId}`
  const response = await fetch(url)
  const data = await response.json()

  return data
}

export const fetchDealStats = async (): Promise<any> => {
  const url = `${FILECOIN_CID_CHECKER_API}/deals/stats`
  const response = await fetch(url)
  const data = await response.json()

  return data
}

export const getDealsCsvUrl = async (
  search: string,
  query: string,
  activeFilter: boolean,
  verifiedFilter: boolean,
  pageSize = PAGE_SIZE,
) => {
  let url = `${FILECOIN_CID_CHECKER_API}/deals/csv?per_page=${pageSize}`

  if (search) {
    url = url + `&selector=${search}`
  }

  if (activeFilter) {
    url = url + '&activeDeal=1'
  }

  if (verifiedFilter) {
    url = url + '&verifiedDeal=1'
  }

  url = url + query

  return url
}
