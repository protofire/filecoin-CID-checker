import React from 'react'

import { PAGE_INDEX_START } from '../config/constants'

export interface SearchContext {
  page: number
  search: string
  setCurrentPage: (page: number) => void
  setCurrentSearch: (search: string) => void
}

export const SEARCH_CONTEXT_DEFAULT_VALUE = {
  page: PAGE_INDEX_START,
  search: '',
  setCurrentPage: () => {},
  setCurrentSearch: () => {},
}

const SearchContext = React.createContext<SearchContext>(SEARCH_CONTEXT_DEFAULT_VALUE)

interface Props {
  children: React.ReactNode
}

export const SearchProvider = (props: Props) => {
  const [page, setPage] = React.useState(PAGE_INDEX_START)
  const [search, setSearch] = React.useState('')

  const setCurrentPage = React.useCallback((page: number): void => {
    setPage(page)
  }, [])

  const setCurrentSearch = React.useCallback((search: string): void => {
    setSearch(search)
  }, [])

  const value = {
    page,
    search,
    setCurrentPage,
    setCurrentSearch,
  }

  return <SearchContext.Provider value={value}>{props.children}</SearchContext.Provider>
}

export const useSearchContext = (): SearchContext => {
  return React.useContext(SearchContext)
}
