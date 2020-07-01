import React from 'react'
import styled from 'styled-components'

const Title = styled.div`
  font-family: Poppins;
  font-size: 20px;
  font-weight: 600;
  line-height: 18px;
  text-align: left;
  color: #ffffff;
`

export const DealsErrorMessage = () => {
  return <Title>There is an error fetching the Deals</Title>
}
