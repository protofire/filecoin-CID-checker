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
const CheckedBox = () => (
  <svg width="20" height="20" viewBox="0 0 360 360" style={{ paddingRight: '5px' }}>
    <path
      d="M303.118,0H56.882C25.516,0,0,25.516,0,56.882v246.236C0,334.484,25.516,360,56.882,360h246.236
		C334.484,360,360,334.484,360,303.118V56.882C360,25.516,334.484,0,303.118,0z M322.078,303.118c0,10.454-8.506,18.96-18.959,18.96
		H56.882c-10.454,0-18.959-8.506-18.959-18.96V56.882c0-10.454,8.506-18.959,18.959-18.959h246.236
		c10.454,0,18.959,8.506,18.959,18.959V303.118z"
      fill="#ddd"
    />
    <path
      d="M249.844,106.585c-6.116,0-11.864,2.383-16.19,6.71l-84.719,84.857l-22.58-22.578c-4.323-4.324-10.071-6.706-16.185-6.706
		c-6.115,0-11.863,2.382-16.187,6.705c-4.323,4.323-6.703,10.071-6.703,16.185c0,6.114,2.38,11.862,6.703,16.184l38.77,38.77
		c4.323,4.324,10.071,6.706,16.186,6.706c6.112,0,11.862-2.383,16.19-6.71L266.03,145.662c8.923-8.926,8.922-23.448,0-32.374
		C261.707,108.966,255.958,106.585,249.844,106.585z"
      fill="#ddd"
    />
  </svg>
)

const UncheckedBox = () => (
  <svg width="20" height="20" viewBox="0 0 360 360" style={{ paddingRight: '5px' }}>
    <path
      d="M303.118,0H56.882C25.516,0,0,25.516,0,56.882v246.236C0,334.484,25.516,360,56.882,360h246.236
  C334.484,360,360,334.484,360,303.118V56.882C360,25.516,334.484,0,303.118,0z M322.078,303.118c0,10.454-8.506,18.96-18.959,18.96
  H56.882c-10.454,0-18.959-8.506-18.959-18.96V56.882c0-10.454,8.506-18.959,18.959-18.959h246.236
  c10.454,0,18.959,8.506,18.959,18.959V303.118z"
      fill="#ddd"
    />
  </svg>
)

export const CheckboxFilter = () => {
  const {
    activeFilter,
    verifiedFilter,
    setCurrentActiveFilter,
    setCurrentVerifiedFilter,
  } = useSearchContext()

  return (
    <>
      <Item
        onClick={() => {
          setCurrentActiveFilter(!activeFilter)
        }}
      >
        {activeFilter && <CheckedBox></CheckedBox>}
        {!activeFilter && <UncheckedBox></UncheckedBox>}
        Active
      </Item>
      <Item
        onClick={() => {
          setCurrentVerifiedFilter(!verifiedFilter)
        }}
      >
        {verifiedFilter && <CheckedBox></CheckedBox>}
        {!verifiedFilter && <UncheckedBox></UncheckedBox>}
        Verified
      </Item>
    </>
  )
}
