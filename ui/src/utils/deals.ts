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
    url = `${FILECOIN_CID_CHECKER_API}deals/${search}`
  }

  const response = await fetch(url)
  const data = await response.json()

  const deals = data?.Deals ?? []

  const formattedDeals: DealValue[] = deals.map((deal: any) => {
    const { DealInfo, SectorInfo, SectorID: Sector = null, State } = deal

    const {
      PieceCID: FileCID,
      Provider: MinerID,
      Client,
      PieceSize,
      VerifiedDeal,
      StartEpoch,
      EndEpoch,
      StoragePricePerEpoch,
      ProviderCollateral,
      ClientCollateral,
    } = DealInfo?.Proposal
    const DealID = DealInfo?.DealID || DealValueNotAvailable
    const Expiration = SectorInfo?.Info?.Info?.Expiration || DealValueNotAvailable
    const SealedCID = SectorInfo?.Info?.Info?.SealedCID || DealValueNotAvailable

    return {
      FileCID,
      DealID,
      MinerID,
      Sector,
      Client,
      PieceSize,
      VerifiedDeal,
      SealedCID,
      StartEpoch,
      EndEpoch,
      StoragePricePerEpoch,
      Expiration,
      ProviderCollateral,
      ClientCollateral,
      State: State || DealStatus.Unknown,
    }
  })

  return formattedDeals
}
