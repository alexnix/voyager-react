import React from 'react'
import { Restaurant } from './types'

interface Props {
  restaurant: Restaurant
  onDelete: () => void
}

const RestaurantComp: React.FC<Props> = ({ restaurant, onDelete }) => {
  return (
    <div>
      {restaurant.name}
      <div>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

export default RestaurantComp
