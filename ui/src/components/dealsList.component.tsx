import React, { HTMLAttributes, useEffect, useState } from 'react'

import { DealItem } from './dealItem.component'
import { RemoteData } from '../utils/remoteData'
import { DealDetailModal } from './dealDetailModal.component'
import { DealValue } from '../utils/types'

interface Props extends HTMLAttributes<HTMLDivElement> {
  deals: RemoteData<DealValue[]>
  openModal: boolean
}

export const DealsList = (props: Props) => {
  const { deals, openModal } = props

  const [isModalOpen, setModalOpen] = useState(false)
  const [clickedDeal, setClickedDeal] = useState<Maybe<DealValue>>(null)

  useEffect(() => {
    if (RemoteData.hasData(deals)) {
      setModalOpen(openModal)
      setClickedDeal(deals.data[0])
    }
  }, [openModal, deals])

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
