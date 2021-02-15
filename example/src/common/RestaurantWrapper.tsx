import React from 'react'
import { useDetlete } from 'voyager-react'
import RestaurantComp from './Restaurant'
import { Restaurant } from './types'

interface Props {
  data: Restaurant
}

const RestaurantWrapper: React.FC<Props> = ({ data }) => {
  const [, deleteRestaurant] = useDetlete('restaurants')

  return (
    <RestaurantComp
      restaurant={data}
      onDelete={() => {
        deleteRestaurant({ id: data._id })
      }}
    />
  )
}

export default RestaurantWrapper
