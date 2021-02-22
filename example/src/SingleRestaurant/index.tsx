import React from 'react'
import {useGet} from 'voyager-react'
import {useParams} from 'react-router-dom'
import ReviewWrapper from './../common/ReviewWrapper'
import List from './../common/List'

function useTopReview(id: string) {
  return useGet('reviews', {
    query: {
      filter: {
        restaurant: ['eq', id]
      },
      sort_by: ['rating', 'desc'],
      page_size: 2
    }
  })
}

const SingleRestaurant = () => {
  const {id} = useParams()

  const [{data: restaurant, loading: restaurantLoading}] = useGet(
    `restaurants/${id}`,
    {
      // spawnFromCache: true
    }
  )

  const [{data: reviews}] = useGet(`reviews`, {
    query: {
      filter: {
        restaurant: ['eq', id]
      }
    }
  })

  const [
    {data: topReviews, loading: topReviewsLoading},
    getTopReview
  ] = useTopReview(id)

  if (restaurantLoading || topReviewsLoading) {
    return <p>Loading</p>
  }

  return (
    <div>
      <h1>{restaurant.name}</h1>
      <h2>Best review</h2>
      <button
        onClick={() => getTopReview({policy: 'no-cache', silent: true})}
      >
        get top
      </button>
      {topReviews.length !== 0 && <ReviewWrapper data={topReviews[0]} />}
      <h2>Latest Reviews</h2>
      {reviews && <List elements={reviews} ElementItem={ReviewWrapper} />}
    </div>
  )
}

export default SingleRestaurant
