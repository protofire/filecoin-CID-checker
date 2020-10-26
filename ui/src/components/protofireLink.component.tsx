import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: block;
  height: 50px;
  position: absolute;
  right: 30px;
  top: 30px;
  width: 50px;
  z-index: 5;
`

const Link = styled.a`
  align-items: center;
  background-color: rgba(207, 224, 255, 0.1);
  border-bottom: 1px solid rgba(66, 193, 202, 0.5);
  border-top: 1px solid rgba(66, 193, 202, 0.5);
  color: rgb(207, 224, 255);
  display: flex;
  font-size: 10px;
  font-weight: 500;
  height: 20px;
  justify-content: center;
  line-height: 1.2;
  position: absolute;
  right: 0;
  top: 0;
  transform: rotate(45deg) translate(50px, -40px);
  transition: all 0.15s linear;
  text-decoration: underline;
  width: 164px;

  &:hover {
    background-color: rgba(207, 224, 255, 0.2);
    color: rgb(255, 255, 255);
    opacity: 1 !important;
  }
`

export const ProtofireLink = () => {
  return (
    <Container>
      <Link href="https://www.protofire.io/" target="_blank">
        Built by Protofire.io
      </Link>
    </Container>
  )
}
