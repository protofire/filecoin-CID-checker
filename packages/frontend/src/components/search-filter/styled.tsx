import styled from 'styled-components'
import React from 'react';

// Search Wrapper
export const SearchWrapper = styled.div`
  position: relative;
  display: inline-block;
  @media (max-width: ${(props) => props.theme.themeBreakPoints.xxl}) {
    width: 650px;
  }
  @media (max-width: ${(props) => props.theme.themeBreakPoints.xl}) {
    width: 500px;
  }
  @media (max-width: ${(props) => props.theme.themeBreakPoints.md}) {
    width: 300px;
    margin-left: 50px;
  }
  @media (max-width: ${(props) => props.theme.themeBreakPoints.sm}) {
    width: 250px;
  }
  @media (max-width: ${(props) => props.theme.themeBreakPoints.xs}) {
    width: 250px;
  }
`

export const Input = styled.input`
  border-top-style: hidden !important;
  border-right-style: hidden !important;
  border-left-style: hidden !important;
  border-bottom-style: hidden !important;
  line-height: 1.2;
  outline: none;
  height: ${(props) => props.theme.textfield.height} !important;
  width: ${(props) => props.theme.textfield.width} !important;
  border-radius: ${(props) => props.theme.textfield.borderRadius} !important;
  font-family: ${(props) => props.theme.textfield.fontFamily};
  font-size: ${(props) => props.theme.textfield.fontSize};
  font-weight: ${(props) => props.theme.textfield.fontWeight};
  padding: ${(props) =>
  props.theme.textfield.paddingVertical +
  ' ' +
  props.theme.textfield.paddingHorizontal} !important;
  text-align: ${(props) => props.theme.textfield.textAlign};
  background-color: ${(props) => props.theme.textfield.backgroundColor};

  // Filled
  color: ${(props) => props.theme.textfield.color};

  &::placeholder {
    color: ${(props) => props.theme.textfield.placeholderColor};
  }

  &:hover {
    background-color: ${(props) => props.theme.textfield.hoverBackgroundColor};
    color: ${(props) => props.theme.textfield.hoverColor};
  }

  &:active,
  &:focus-within {
    color: ${(props) => props.theme.textfield.focusColor};
    border: solid 1px rgba(66, 193, 202, 0.5);
    background-color: rgba(207, 224, 255, 0.1);
    border-top-style: solid !important;
    border-right-style: solid !important;
    border-left-style: solid !important;
    border-bottom-style: solid !important;
  }
  @media (max-width: ${(props) => props.theme.themeBreakPoints.xxl}) {
    width: 650px !important;
  }
  @media (max-width: ${(props) => props.theme.themeBreakPoints.xl}) {
    width: 500px !important;
  }
  @media (max-width: ${(props) => props.theme.themeBreakPoints.md}) {
    width: 300px !important;
  }
  @media (max-width: ${(props) => props.theme.themeBreakPoints.sm}) {
    width: 250px !important;
  }
  @media (max-width: ${(props) => props.theme.themeBreakPoints.xs}) {
    width: 250px !important;
  }
`

// Lens Definition
export const LensWrapper = styled.div`
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
export const LensImageWrapper = styled.div`
  width: 24px;
  height: 24px;
  padding: 8px;
`

// Close Definition
export const CloseWrapper = styled.div`
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
export const CloseImageWrapper = styled.div`
  width: 24px;
  height: 24px;
  padding: 8px;
`

export const Item = styled.div`
  color: #fff;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  margin-right: 10px;
  cursor: pointer;
`

export const CheckedBox = () => (
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

export const UncheckedBox = () => (
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

export const CheckboxFilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  max-width: 80px;
  height: 56px;
  text-decoration: none;
  margin-right: 50px;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    align-items: center;    
    max-width: none;
    padding-left: 20px;
  }
`

export const SearchSingleWrapper = styled.div`
  display: flex;

`