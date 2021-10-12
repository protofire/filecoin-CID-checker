import React from 'react'

import { PAGE_INDEX_START } from '../config/constants'

export interface SearchContext {
  page: number
  search: string
  query: string
  activeFilter: boolean
  verifiedFilter: boolean
  setCurrentPage: (page: number) => void
  setCurrentSearch: (search: string) => void
  setCurrentQuery: (query: string) => void
  setCurrentActiveFilter: (value: boolean) => void
  setCurrentVerifiedFilter: (value: boolean) => void
}

export const SEARCH_CONTEXT_DEFAULT_VALUE = {
  page: PAGE_INDEX_START,
  search: '',
  query: '',
  activeFilter: false,
  verifiedFilter: false,
  setCurrentPage: () => {},
  setCurrentSearch: () => {},
  setCurrentQuery: () => {},
  setCurrentActiveFilter: () => {},
  setCurrentVerifiedFilter: () => {},
}

const SearchContext = React.createContext<SearchContext>(SEARCH_CONTEXT_DEFAULT_VALUE)

interface Props {
  children: React.ReactNode
}

export const SearchProvider = (props: Props) => {
  const [page, setPage] = React.useState(PAGE_INDEX_START)
  const [search, setSearch] = React.useState('')
  const [activeFilter, setActiveFilter] = React.useState(false)
  const [verifiedFilter, setVerifiedFilter] = React.useState(false)

  const [query, setQuery] = React.useState('&sort_by_column=status&sort_direction=-1')

  const setCurrentPage = React.useCallback((page: number): void => {
    setPage(page)
  }, [])

  const setCurrentSearch = React.useCallback((search: string): void => {
    setSearch(search)
  }, [])

  const setCurrentQuery = React.useCallback((sort: string): void => {
    setQuery(sort)
  }, [])

  const setCurrentActiveFilter = React.useCallback((value: boolean): void => {
    setActiveFilter(value)
  }, [])

  const setCurrentVerifiedFilter = React.useCallback((value: boolean): void => {
    setVerifiedFilter(value)
  }, [])

  const value = {
    page,
    search,
    query,
    activeFilter,
    verifiedFilter,
    setCurrentPage,
    setCurrentSearch,
    setCurrentQuery,
    setCurrentActiveFilter,
    setCurrentVerifiedFilter,
  }

  return <SearchContext.Provider value={value}>{props.children}</SearchContext.Provider>
}

export const useSearchContext = (): SearchContext => {
  return React.useContext(SearchContext)
}
