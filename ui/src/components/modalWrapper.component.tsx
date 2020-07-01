import React from 'react'
import Modal from 'react-modal'
import { withTheme } from 'styled-components'

interface Props extends React.ComponentProps<typeof Modal> {
  children: React.ReactNode
  theme?: any
}

export const ModalContainer: React.FC<Props> = props => {
  const { onRequestClose, theme, children, ...restProps } = props
  const { modalStyle } = theme

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal
      {...restProps}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
      shouldCloseOnOverlayClick={true}
      style={modalStyle}
    >
      {children}
    </Modal>
  )
}

export const ModalWrapper = withTheme(ModalContainer)
