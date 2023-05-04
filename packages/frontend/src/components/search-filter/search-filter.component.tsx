import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {EventEmitter, RegistryEvents} from '../../utils/event-emitter'
import { Lens } from '../common/images/lens.component'
import { Close } from '../common/images/close.component'
import {
  SearchWrapper,
  Input,
  LensWrapper,
  LensImageWrapper,
  CloseWrapper,
  CloseImageWrapper,
  Item,
  CheckedBox,
  UncheckedBox,
  CheckboxFilterWrapper,
  SearchSingleWrapper
} from './styled'
// import { useSearchContext } from '../state/search.context'

interface ISearchFilter {
  selector: string
  activeDeal?: boolean
  verifiedDeal?: boolean
}

const defaultFilter: ISearchFilter = {
  selector: '',
  activeDeal: false,
  verifiedDeal: false
}

enum DealStatus {
  vefifiedDeal,
  activeDeal,
}

export const SearchSingle = () => {
  const [filter, setFilter] =  useState(defaultFilter)

  const history = useHistory()

  const onSearch = (newFilter: ISearchFilter) => {
    EventEmitter.dispatch(RegistryEvents.updateFilter, newFilter)

    // setCurrentSearch(searchValueLocal)
    // setCurrentPage(1)
    // history.push(searchValueLocal)
  }

  const onDealStatus = (name: DealStatus, value: boolean | undefined) => {
    switch (name) {
      case DealStatus.vefifiedDeal:
        setFilter({ ...filter, verifiedDeal: value})
        onSearch({ ...filter, verifiedDeal: value})
        break
      case DealStatus.activeDeal:
        setFilter({ ...filter, activeDeal: value})
        onSearch({ ...filter, activeDeal: value})
        break
      default:
        break
    }
  }

  const onClear = () => {
    setFilter({ ...filter, selector: defaultFilter.selector })
    history.push('/')
  }

  const onChange = (event: any) => {
    const searchValueLocalSanitized = event.target.value.replace(/\/\//g, '')

    if (searchValueLocalSanitized) {
      setFilter({ ...filter, selector: searchValueLocalSanitized})
      // setSearchValueLocal(searchValueLocalSanitized)
    } else {
      onClear()
    }
  }

  return (
    <SearchSingleWrapper>
      <SearchWrapper>
        <LensWrapper onClick={() => onSearch(filter)}>
          <LensImageWrapper>
            <Lens />
          </LensImageWrapper>
        </LensWrapper>
        { filter.selector !== defaultFilter.selector &&
          <CloseWrapper onClick={onClear}>
            <CloseImageWrapper>
              <Close/>
            </CloseImageWrapper>
          </CloseWrapper>
        }
        <Input
          className="search"
          value={filter.selector}
          onChange={onChange}
          onKeyPress={(event) => {
            if (event.key === 'Enter') onSearch(filter)
          }}
          name="value"
          type="text"
          placeholder="Search by Piece CID, Deal ID, or Miner ID"
        />
      </SearchWrapper>
      <CheckboxFilterWrapper>
        <Item
          onClick={() => onDealStatus(DealStatus.activeDeal, !filter.activeDeal)}
        >
          {filter.activeDeal && <CheckedBox></CheckedBox>}
          {!filter.activeDeal && <UncheckedBox></UncheckedBox>}
          Active
        </Item>
        <Item
          onClick={() => onDealStatus(DealStatus.vefifiedDeal, !filter.verifiedDeal)}
        >
          {filter.verifiedDeal && <CheckedBox></CheckedBox>}
          {!filter.verifiedDeal && <UncheckedBox></UncheckedBox>}
          Verified
        </Item>
      </CheckboxFilterWrapper>
    </SearchSingleWrapper>
  )
}
