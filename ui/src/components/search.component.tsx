import React, { HTMLAttributes, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Lens } from './common/images/lens.component'
import { Close } from './common/images/close.component'

interface Props extends HTMLAttributes<HTMLDivElement> {
  search: string
}

// Search Wrapper
const SearchWrapper = styled.div`
  position: relative;
  display: inline-block;
`

// Input
export const Input = styled.input`
  border-top-style: hidden !important;
  border-right-style: hidden !important;
  border-left-style: hidden !important;
  border-bottom-style: hidden !important;
  line-height: 1.2;
  outline: none;
  height: ${props => props.theme.textfield.height} !important;
  width: ${props => props.theme.textfield.width} !important;
  border-radius: ${props => props.theme.textfield.borderRadius} !important;
  font-family: ${props => props.theme.textfield.fontFamily};
  font-size: ${props => props.theme.textfield.fontSize};
  font-weight: ${props => props.theme.textfield.fontWeight};
  padding: ${props =>
    props.theme.textfield.paddingVertical +
    ' ' +
    props.theme.textfield.paddingHorizontal} !important;
  text-align: ${props => props.theme.textfield.textAlign};
  background-color: ${props => props.theme.textfield.backgroundColor};

  // Filled
  color: ${props => props.theme.textfield.color};

  &::placeholder {
    color: ${props => props.theme.textfield.placeholderColor};
  }

  &:hover {
    background-color: ${props => props.theme.textfield.hoverBackgroundColor};
    color: ${props => props.theme.textfield.hoverColor};
  }

  &:active,
  &:focus-within {
    color: ${props => props.theme.textfield.focusColor};
    border: solid 1px rgba(66, 193, 202, 0.5);
    background-color: rgba(207, 224, 255, 0.1);
    border-top-style: solid !important;
    border-right-style: solid !important;
    border-left-style: solid !important;
    border-bottom-style: solid !important;
  }
`

// Lens Definition
const LensWrapper = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  top: 8px;
  right: 8px;
  bottom: 8px;
  border-radius: 24px;
  background-color: #42c1ca;
  cursor: pointer;
  &:hover {
    background-color: #1c939b;
  }
  &:active,
  &:focus-within {
    background-color: rgb(207, 224, 255, 0.2);
  }
`

// Wrapper for the image inside circle
const LensImageWrapper = styled.div`
  width: 24px;
  height: 24px;
  padding: 8px;
`

// Close Definition
const CloseWrapper = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  top: 8px;
  right: 56px;
  bottom: 8px;
  border-radius: 24px;
  cursor: pointer;
  &:hover {
    background-color: rgb(207, 224, 255, 0.1);
  }
  &:active,
  &:focus-within {
    background-color: rgb(207, 224, 255, 0.2);
  }
`

// Wrapper for the image inside circle
const CloseImageWrapper = styled.div`
  width: 24px;
  height: 24px;
  padding: 8px;
`

export const Search = (props: Props) => {
  const { search } = props

  const history = useHistory()
  const [searchValue, setSearchValue] = useState(search)

  const onSearch = () => {
    // If the user write a backslash, this will throw an error, that is we remove, maybe a better option is to disallow the user to write a '/' or throw an error in the UI
    const searchToPush = `/${searchValue.replace(/\//g, '')}`
    history.push(searchToPush)
  }

  const onClear = () => {
    setSearchValue('')
    history.push('/')
  }

  return (
    <SearchWrapper>
      <LensWrapper onClick={onSearch}>
        <LensImageWrapper>
          <Lens />
        </LensImageWrapper>
      </LensWrapper>
      {searchValue && (
        <CloseWrapper onClick={onClear}>
          <CloseImageWrapper>
            <Close />
          </CloseImageWrapper>
        </CloseWrapper>
      )}
      <Input
        className="search"
        value={searchValue}
        onChange={event => setSearchValue(event.target.value)}
        onKeyPress={event => {
          if (event.key === 'Enter') onSearch()
        }}
        name="value"
        type="text"
        placeholder="Search by File CID, Deal ID, or Miner ID"
      />
    </SearchWrapper>
  )
}
