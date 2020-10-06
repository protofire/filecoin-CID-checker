import { Router, Request, Response, NextFunction } from 'express'
import { getDbo } from '../helpers/db'
import { getLogger } from '../helpers/logger'

function isNormalInteger(str: string) {
  const n = Math.floor(Number(str))
  return n !== Infinity && String(n) === str && n >= 0
}

export async function getDeals(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const logger = getLogger('router:deals/getDeals')
  try {
    const selector = req.params.selector

    const perPage = isNormalInteger(req.query.per_page as string)
      ? parseInt(req.query.per_page as string)
      : 10
    const page = isNormalInteger(req.query.page as string)
      ? parseInt(req.query.page as string)
      : 1
    const skip = perPage * (page - 1)

    let query = {}
    if (selector) {
      if (isNormalInteger(selector)) {
        const dealID = parseInt(selector)
        query = { _id: dealID }
      } else {
        query = {
          $or: [
            { 'Proposal.PieceCID': selector },
            { 'Proposal.Provider': selector },
          ],
        }
      }
    }

    const dbo = await getDbo()
    let deals = await dbo
      .collection('deals')
      .find(query)
      .limit(perPage)
      .skip(skip)
      .sort({ _id: -1 })
      .toArray()

    deals = await Promise.all(
      deals.map(async (deal: any) => {
        const dealID = deal['_id']
        const sector = await dbo
          .collection('sectors')
          .findOne({ DealIDs: dealID })
        return {
          DealInfo: deal,
          DealID: dealID,
          SectorInfo: sector,
        }
      }),
    )

    const response = {
      Pagination: {
        Page: page,
        PerPage: perPage,
      },
      Deals: deals,
    }

    res.send(response)
  } catch (err) {
    logger(err)
    next(err)
  }
}

export const dealsRouter = Router()
dealsRouter.get('/', getDeals)
dealsRouter.get('/:selector', getDeals)
