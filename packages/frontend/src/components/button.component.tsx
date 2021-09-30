import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

interface ButtonCommonProps {
  theme?: any
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonCommonProps {}

const Wrapper = styled.button<ButtonProps>`
  width: 312px;
  height: 56px;
  border-radius: 28px;
  background-color: #42c1ca;
  font-family: Poppins;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  text-align: left;
  color: #ffffff;
  -moz-outline-style: none;
  outline: none;
  &:active,
  &:focus-within {
    outline: 0;
    background-color: rgb(207, 224, 255, 0.2);
  }
  &:hover {
    background-color: #1c939b;
  }
`

export const Button = (props: ButtonProps) => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
