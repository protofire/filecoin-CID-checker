import React, { useState } from 'react'
import styled from 'styled-components'
import useEventListener from 'use-typed-event-listener'

import { Top } from './common/images/top.component'
import { Button } from './button.component'

const ScrollToTopWrapper = styled(Button)`
  padding: 5px;
  position: fixed;
  bottom: 20px;
  z-index: 1000;
  cursor: pointer;
  animation: fadeIn 0.3s;
  transition: opacity 0.4s;
  opacity: 0.5;
  right: 10px;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  &:hover {
    opacity: 1;
  }
`

export const BackToTop = () => {
  const [showScroll, setShowScroll] = useState(false)

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true)
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false)
    }
  }

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEventListener(window, 'scroll', checkScrollTop)

  return (
    <ScrollToTopWrapper
      onClick={scrollTop}
      title="Back to top"
      style={{ display: showScroll ? 'flex' : 'none' }}
    >
      <Top />
    </ScrollToTopWrapper>
  )
}
