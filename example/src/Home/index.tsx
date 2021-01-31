import React, { useState } from 'react'
import { useGet } from 'voyager'
import List from '../common/List'
import RestaurantWrapper from '../common/RestaurantWrapper'

const Home = () => {
  const [minRating, setMinRating] = useState<number>(1)

  const [{ data, loading }] = useGet('restaurants', {
    query: {
      filter: {
        avg_rating: ['gte', minRating]
      }
    }
  })

  if (loading) return null

  return (
    <div>
      min rating
      <input
        type='number'
        value={minRating}
        onChange={(e) => setMinRating(Number(e.target.value))}
      />
      <List elements={data} ElementItem={RestaurantWrapper} />
    </div>
  )
}

export default Home
