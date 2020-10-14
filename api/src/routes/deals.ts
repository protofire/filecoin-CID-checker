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
            { 'Proposal.PieceCID': { '/': selector } },
            { 'Proposal.Label': selector },
            { 'Proposal.Provider': selector },
          ],
        }
      }
    }

    const dbo = await getDbo()
    const queryResults = await dbo
      .collection('deals')
      .find(query)
      .limit(perPage)
      .skip(skip)
      .sort({ _id: -1 })
      .toArray()
    const deals = queryResults.map((deal: any) => ({
      DealID: deal['_id'],
      DealInfo: deal,
    }))

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
