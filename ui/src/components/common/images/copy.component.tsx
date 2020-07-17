import React from 'react'

interface Props {
  className?: string
}

export const Copy = (props: Props) => {
  return (
    <img {...props} src="https://icongr.am/clarity/copy.svg?size=16&color=ffffff&amp;" alt="icon" />
  )
}
