import React, { useCallback } from 'react'
import { useGet, useCacheObserver } from 'voyager-react'
import { useParams } from 'react-router-dom'
import ReviewWrapper from './../common/ReviewWrapper'
import List from './../common/List'
import LeaveReview from './LeaveReview'
import UpdateCache from './UpdateCache'

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
  const { id } = useParams()

  useCacheObserver(useCallback((verb) => console.log('verb: ', verb), []))

  const [{ data: restaurant, loading: restaurantLoading }] = useGet(
    `restaurants/${id}`,
    {
      // spawnFromCache: true
    }
  )

  const [{ data: reviews }] = useGet(`reviews`, {
    query: {
      filter: {
        restaurant: ['eq', id]
      }
    }
  })

  const [
    { data: topReviews, loading: topReviewsLoading },
    getTopReview
  ] = useTopReview(id)

  const obs = useCallback(
    (verb, data) => {
      console.log('verb, data: ', verb, data)
    },
    [getTopReview]
  )

  useCacheObserver(obs)

  if (restaurantLoading || topReviewsLoading) {
    return <p>Loading</p>
  }

  return (
    <div>
      <h1>{restaurant.name}</h1>
      <UpdateCache restaurantId={restaurant._id} />
      <LeaveReview restaurantId={restaurant._id} />
      <h2>Best review</h2>
      <button
        onClick={() => getTopReview({ policy: 'no-cache', silent: true })}
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
