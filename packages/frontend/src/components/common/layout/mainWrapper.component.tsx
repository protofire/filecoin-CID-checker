import React from 'react'

export const MainWrapper: React.FC = props => {
  const { children, ...restProps } = props

  return (
    <div className="container" {...restProps}>
      {children}
    </div>
  )
}
