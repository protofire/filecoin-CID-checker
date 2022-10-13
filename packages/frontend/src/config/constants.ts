/*eslint-disable*/
console.info('process.env.REACT_APP_FILECOIN_CID_CHECKER_API', process.env.REACT_APP_FILECOIN_CID_CHECKER_API)
/*eslint-enable*/

export const FILECOIN_CID_CHECKER_API: string =
  process.env.REACT_APP_FILECOIN_CID_CHECKER_API || '/api'

export const DOCUMENT_TITLE: string = process.env.REACT_APP_TITLE || 'FileCoin CID Checker'

export const DOCUMENT_DESCRIPTION: string =
  process.env.REACT_APP_DESCRIPTION ||
  'A website and API service that can list all CIDs along with their current status in the latest state tree'

export const PAGE_SIZE = Number(process.env.REACT_APP_PAGE_SIZE || 20)

export const PAGE_INDEX_START = Number(process.env.REACT_APP_PAGE_INDEX_START || 1)

export const REPOSITORY_URL: string =
  process.env.REACT_APP_REPOSITORY_URL || 'https://github.com/glifio/cid-checker'
