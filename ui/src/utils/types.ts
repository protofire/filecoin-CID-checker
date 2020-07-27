export enum DealStatus {
  Active = 'Active',
  Fault = 'Fault',
  Recovery = 'Recovery',
  Unknown = 'Unknown',
}

export const DealValueNotAvailable = 'Not Available'

export interface DealValue {
  FileCID: string
  DealID: number
  MinerID: string
  Sector: string
  Client: string
  PieceSize: number
  VerifiedDeal: boolean
  SealedCID: string
  StartEpoch: number
  EndEpoch: number
  Expiration: string
  StoragePricePerEpoch: number
  ProviderCollateral: number
  ClientCollateral: number
  State: DealStatus
}

export enum DealTitles {
  FileCID = 'Piece CID',
  DealID = 'Deal ID',
  MinerID = 'Miner ID',
  Sector = 'Sector',
  Client = 'Client',
  PieceSize = 'Piece Size',
  VerifiedDeal = 'Verified Deal',
  SealedCID = 'Sealed CID',
  StartEpoch = 'Start Deal',
  EndEpoch = 'End Deal',
  Expiration = 'Expiration',
  StoragePricePerEpoch = 'Price',
  ProviderCollateral = 'Miner Collateral',
  ClientCollateral = 'Client Collateral',
  State = 'Status',
}
