import { FILECOIN_CID_CHECKER_API, PAGE_SIZE } from '../config/constants'
import { DealStatus, DealValue, DealValueNotAvailable } from './types'

export const truncateStringInTheMiddle = (
  str: string,
  strPositionStart: number,
  strPositionEnd: number,
) => {
  const minTruncatedLength = strPositionStart + strPositionEnd
  if (minTruncatedLength < str.length) {
    return `${str.substr(0, strPositionStart)}...${str.substr(
      str.length - strPositionEnd,
      str.length,
    )}`
  }
  return str
}

export const fetchDeals = async (search: string, page: number): Promise<DealValue[]> => {
  let url = `${FILECOIN_CID_CHECKER_API}deals?page=${page}&per_page=${PAGE_SIZE}`
  if (search) {
    url = `${FILECOIN_CID_CHECKER_API}deals/${search}?page=${page}&per_page=${PAGE_SIZE}`
  }

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
      StoragePricePerEpoch,
      ProviderCollateral,
      ClientCollateral,
      State,
      Label,
    }
  })

  return formattedDeals
}
