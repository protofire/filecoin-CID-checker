import { Router, Request, Response, NextFunction } from 'express'
import { getDbo } from '../helpers/db'
import { getLogger } from '../helpers/logger'
import { getChainHead, getStateAccountKey, getStateLookupId } from '../helpers/lotusApi'

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
  let selector = req.params.selector;

  try {
    const idFromSelector = await getStateLookupId(selector);
    if (idFromSelector) {
      selector = idFromSelector;
    }
  } catch {}

  try {
    const perPage = isNormalInteger(req.query.per_page as string)
      ? parseInt(req.query.per_page as string)
      : 10
    const page = isNormalInteger(req.query.page as string)
      ? parseInt(req.query.page as string)
      : 1
    const skip = perPage * (page - 1)

    const sortByColumn = req.query.sort_by_column ? req.query.sort_by_column as string : '';
    const sortDirection = isNormalInteger(req.query.sort_direction as string) ? parseInt(req.query.sort_direction as string) : -1
    let sortCriteria: any = { _id: -1 };

    if (sortByColumn === 'status') {
      sortCriteria = {
        'State.SectorStartEpoch': sortDirection,
        _id: -1,
      };
    }

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
            { 'Proposal.Client': selector }
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
      .sort(sortCriteria)
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

export async function getDealInfo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const logger = getLogger('router:deals/getDealInfo')
  try {
    const dealId = req.params.dealId
    let query;
    if (isNormalInteger(dealId)) {
      const dealID = parseInt(dealId)
      query = { _id: dealID }
    } else {
      next(new Error('Invalid deal id'))
    }

    const dbo = await getDbo()
    const queryResults: any[] = await dbo
      .collection('deals')
      .find(query)
      .toArray();

    if (queryResults.length !== 1) {
      next(new Error('Error retrieving deal'))
    }
    const deal = queryResults[0];

    const minerId = deal.Proposal.Provider;
    const clientId = deal.Proposal.Client;

    const clientAddress = await getStateAccountKey(clientId);

    const response = {
      clientAddress: clientAddress ? clientAddress : '',
    };

    res.send(response)
  } catch (err) {
    logger(err)
    next(err)
  }
}

export const dealsRouter = Router()
dealsRouter.get('/', getDeals)
dealsRouter.get('/details/:dealId', getDealInfo)
dealsRouter.get('/:selector', getDeals)

