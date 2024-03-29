export enum DealStatus {
  Active = 'Active',
  Fault = 'Fault',
  Recovery = 'Recovery',
  Unknown = 'Unknown',
  Expired = 'Expired',
}

export const DealValueNotAvailable = 'N/A'

export interface DealValue {
  PieceCID: string
  DealID: number
  MinerID: string
  Client: string
  PieceSize: number
  VerifiedDeal: boolean
  StartEpoch: number
  EndEpoch: number
  StoragePricePerEpoch: number
  ProviderCollateral: number
  ClientCollateral: number
  State: DealStatus
  Label: string
  StartEpochAsDate: string
  EndEpochAsDate: string
}

export enum DealTitles {
  PieceCID = 'Piece CID',
  Label = 'Label',
  DealID = 'Deal ID',
  MinerID = 'Miner ID',
  PayloadCID = 'Payload CID',
  Client = 'Client',
  ClientAddress = 'Client Address',
  PieceSize = 'Piece Size',
  VerifiedDeal = 'Verified Deal',
  StartEpoch = 'Start Deal',
  EndEpoch = 'End Deal',
  Expiration = 'Expiration',
  StoragePricePerEpoch = 'Price',
  ProviderCollateral = 'Miner Collateral',
  ClientCollateral = 'Client Collateral',
  State = 'Status',
  StartEpochAsDate = 'Start Deal(date)',
  EndEpochAsDate = 'End Deal(date)'
}

export interface DealDetails {
  clientAddress?: string
}

export interface GaTagId {
  gaTagId: string | undefined
}

export interface INetwork {
  id: string
  label: string
  url: string
}

export interface QueryParams {
  [key:string]: string;
}

export interface DealStat {
  numberOfUniqueCIDs: number
  numberOfUniqueProviders: number
  numberOfUniqueClients: number
  totalDeals: number
  totalDealSize: number
  latestHeight: number
}