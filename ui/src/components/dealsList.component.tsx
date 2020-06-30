import React, { HTMLAttributes, useState } from 'react'

import { DealItem } from './dealItem.component'
import { RemoteData } from '../utils/remoteData'
import { DealDetailModal } from './dealDetailModal.component'
import { DealValue } from '../utils/types'

interface Props extends HTMLAttributes<HTMLDivElement> {
  deals: RemoteData<DealValue[]>
}

export const DealsList = (props: Props) => {
  const { deals } = props

  const [isModalOpen, setModalOpen] = useState(false)
  const [clickedDeal, setClickedDeal] = useState<Maybe<DealValue>>(null)

  return (
    <>
      {RemoteData.hasData(deals) &&
        deals.data.map((deal: any, index: number) => {
          return (
            <DealItem
              key={index}
              deal={deal}
              onClick={() => {
                setModalOpen(true)
                setClickedDeal(deal)
              }}
            />
          )
        })}
      <DealDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false)
        }}
        deal={clickedDeal}
      />
    </>
  )
}
