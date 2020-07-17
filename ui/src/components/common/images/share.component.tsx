import React from 'react'

interface Props {
  className?: string
}

export const Share = (props: Props) => {
  return (
    <img
      {...props}
      src="https://icongr.am/clarity/share.svg?size=18&color=ffffff&amp;"
      alt="icon"
    />
  )
}
