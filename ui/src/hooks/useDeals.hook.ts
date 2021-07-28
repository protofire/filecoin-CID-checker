import { useEffect, useState } from 'react'

import { fetchDeals } from '../utils/deals'
import { RemoteData } from '../utils/remoteData'
import { DealValue } from '../utils/types'
import { PAGE_SIZE } from '../config/constants'

export const useDeals = (
  search: string,
  page: number,
  query: string,
  activeFilter: boolean,
  verifiedFilter: boolean,
): { deals: RemoteData<any[]>; moreDeals: boolean } => {
  const [deals, setDeals] = useState<RemoteData<DealValue[]>>(RemoteData.loading())
  const [moreDeals, setMoreDeals] = useState(true)
  const [reqHash, setReqHash] = useState('')
  const encodedSearch = encodeURIComponent(search)
  const crtReqHash = JSON.stringify([encodedSearch, query, activeFilter, verifiedFilter])

  useEffect(() => {
    let didCancel = false

    const run = async () => {
      try {
        if (reqHash !== crtReqHash) {
          setDeals(RemoteData.loading())
        } else {
          setDeals(deals =>
            RemoteData.hasData(deals) ? RemoteData.reloading(deals.data) : RemoteData.loading(),
          )
        }

        const deals = await fetchDeals(encodedSearch, page, query, activeFilter, verifiedFilter)

        if (!didCancel) {
          setDeals(currentDeals =>
            RemoteData.hasData(currentDeals) && page !== 1
              ? RemoteData.success(currentDeals.data.concat(deals))
              : RemoteData.success(deals),
          )

          setMoreDeals(deals.length === PAGE_SIZE)
          setReqHash(crtReqHash)
        }
      } catch (e) {
        if (!didCancel) {
          setDeals(RemoteData.failure(e))
        }
      }
    }

    run()

    return () => {
      didCancel = true
    }
  }, [search, page, query, activeFilter, verifiedFilter])

  return {
    deals,
    moreDeals,
  }
}
