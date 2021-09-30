import React from 'react'
import styled from 'styled-components'

const Svg = styled.svg``

const LensWrapper = styled.div`
  width: 24px;
  height: 24px;
  object-fit: contain;
`

export const Lens = () => {
  return (
    <LensWrapper>
      <Svg
        fill="none"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          id="prefix__Rectangle_695"
          d="M0 0H24V24H0z"
          className="prefix__cls-1"
          data-name="Rectangle 695"
        />
        <g
          id="prefix__Ellipse_40"
          fill="none"
          stroke="#fff"
          strokeWidth="2px"
          data-name="Ellipse 40"
          transform="translate(3 3)"
        >
          <circle cx="8" cy="8" r="8" stroke="none" />
          <circle cx="8" cy="8" r="7" className="prefix__cls-1" />
        </g>
        <path
          id="prefix__Rectangle_664"
          fill="#fff"
          d="M0 0H6V2H0z"
          data-name="Rectangle 664"
          transform="rotate(45 -10.228 28.107)"
        />
      </Svg>
    </LensWrapper>
  )
}
