import React from 'react'
import { useDetlete } from 'voyager'
import { Link } from 'react-router-dom'
import RestaurantComp from './Restaurant'
import { Restaurant } from './types'

interface Props {
  data: Restaurant
}

const RestaurantWrapper: React.FC<Props> = ({ data }) => {
  const [deleteRestaurant] = useDetlete('restaurants')

  return (
    <Link to={`/restaurant/${data._id}`}>
      <RestaurantComp
        restaurant={data}
        onDelete={() => {
          deleteRestaurant({ id: data._id })
        }}
      />
    </Link>
  )
}

export default RestaurantWrapper
