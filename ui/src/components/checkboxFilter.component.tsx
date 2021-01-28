import React from 'react'
import styled from 'styled-components'

import { useSearchContext } from '../state/search.context'

const Item = styled.div`
  color: #fff;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  margin-right: 10px;
  cursor: pointer;
`
const CheckedBox = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 32px;
  background-color: #3db14a;
  margin-right:5px;
`
const UncheckedBox = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 32px;
  background-color: #8a8a8a;
  margin-right:5px;
`

export const CheckboxFilter = () => {
  const { activeFilter, verifiedFilter, setCurrentActiveFilter, setCurrentVerifiedFilter } = useSearchContext()

  return (
    <>
      <Item onClick={() => { setCurrentActiveFilter(!activeFilter) }}>
        {activeFilter &&
          <CheckedBox></CheckedBox>
        }
        {!activeFilter &&
          <UncheckedBox></UncheckedBox>
        }
          Active
        </Item>
      <Item onClick={() => { setCurrentVerifiedFilter(!verifiedFilter) }}>
        {verifiedFilter &&
          <CheckedBox></CheckedBox>
        }
        {!verifiedFilter &&
          <UncheckedBox></UncheckedBox>
        }
          Verified
        </Item>
    </>
  )
}
