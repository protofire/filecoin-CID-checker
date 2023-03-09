import { QueryParams } from './types'

export const parseQuery = () => {
  const { location } = window

  const searchString = location.search.replace(/^\?/,'')
  const array = searchString.split('&')
  const result: QueryParams = {}

  array.forEach((str: string) => {
    const [key, value] = str.split('=')
    const decodedKey = decodeURIComponent(key)
    result[decodedKey] = decodeURIComponent(value)
  })

  return result
}