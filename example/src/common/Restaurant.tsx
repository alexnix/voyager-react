import React from 'react'
import { Restaurant } from './types'
import { Link } from 'react-router-dom'

interface Props {
  restaurant: Restaurant
  onDelete: () => void
}

const RestaurantComp: React.FC<Props> = ({ restaurant, onDelete }) => {
  return (
    <div>
      <Link to={`/restaurant/${restaurant._id}`}>{restaurant.name}</Link>
      {' - '}
      {restaurant.num_reviews} reviews
      <div>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

export default RestaurantComp
