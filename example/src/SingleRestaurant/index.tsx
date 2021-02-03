import React from 'react'
import { useGet } from 'voyager'
import { useParams } from 'react-router-dom'
import ReviewWrapper from './../common/ReviewWrapper'
import List from './../common/List'

const SingleRestaurant = () => {
  const { id } = useParams()

  const [{ data: restaurant, loading: restaurantLoading }] = useGet(
    `restaurants/${id}`,
    {
      spawnFromCache: true
    }
  )

  const [{ data: reviews }] = useGet(`reviews`, {
    query: {
      filter: {
        restaurant: ['eq', id]
      }
    }
  })

  const [{ data: topReviews }] = useGet('reviews', {
    strictSoring: true,
    query: {
      filter: {
        restaurant: ['eq', id]
      },
      sort_by: ['rating', 'desc'],
      page_size: 2
    }
  })

  console.log(topReviews)

  // console.log(restaurantLoading, restaurant)
  // heheh

  if (restaurantLoading) {
    return <p>Loading</p>
  }

  return (
    <div>
      <h1>{restaurant.name}</h1>
      {reviews && <List elements={reviews} ElementItem={ReviewWrapper} />}
    </div>
  )
}

export default SingleRestaurant
