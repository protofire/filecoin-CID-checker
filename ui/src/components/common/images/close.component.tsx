import React from 'react'
import styled from 'styled-components'

const Svg = styled.svg``

const CloseWrapper = styled.div`
  width: 24px;
  height: 24px;
  object-fit: contain;
`

export const Close = () => {
  return (
    <CloseWrapper>
      <Svg
        fill="none"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path id="prefix__Rectangle_694" fill="none" d="M0 0H24V24H0z" data-name="Rectangle 694" />
        <path
          id="prefix__Union_10"
          fill="#fff"
          d="M19015 8064v-6h-6v-2h6v-6h2v6h6v2h-6v6z"
          data-name="Union 10"
          transform="rotate(-45 -197.171 26974.356)"
        />
      </Svg>
    </CloseWrapper>
  )
}
