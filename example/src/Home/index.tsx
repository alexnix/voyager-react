import React, { useState } from 'react'
import { usePagination } from 'voyager'
import List from '../common/List'
import RestaurantWrapper from '../common/RestaurantWrapper'

const Home = () => {
  const [minRating, setMinRating] = useState<number>(0)

  const [
    { loading, data, meta },
    ,
    nextPage,
    prevPage,
    setCurrentPage
  ] = usePagination('restaurants', {
    query: {
      filter: {
        avg_rating: ['gte', minRating]
      },
      page_size: 2
    }
  })

  // console.log('data: ', data)

  if (loading) return null

  return (
    <div>
      <h1>Home Page</h1>
      min rating
      <input
        type='number'
        value={minRating}
        onChange={(e) => {
          setMinRating(Number(e.target.value))
          setCurrentPage(0)
        }}
      />
      <List elements={data} ElementItem={RestaurantWrapper} />
      <div>Totala of {meta.total} restaurants.</div>
      {meta.hasPrev && <button onClick={prevPage}>Prev</button>}{' '}
      {meta.hasNext && <button onClick={nextPage}>Next</button>}{' '}
    </div>
  )
}

export default Home
