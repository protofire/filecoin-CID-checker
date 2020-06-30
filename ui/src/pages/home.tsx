import React from 'react'
import { useParams } from 'react-router-dom'

import { Deals } from '../components/deals.component'

export const Home = () => {
  const { search } = useParams()

  return (
    <>
      <Deals search={search || ''} />
    </>
  )
}
