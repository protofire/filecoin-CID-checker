import { GaTagId } from './types';
import { FILECOIN_CID_CHECKER_API } from '../config/constants';

export const fetchGaTag = async (): Promise<GaTagId> => {
  const url = `${FILECOIN_CID_CHECKER_API}/ga-tag-id`
  const response = await fetch(url)
  const data = await response.json()

  return data
}
