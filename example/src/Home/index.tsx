import React, { useState } from 'react'
import { usePagination } from 'voyager-react'
import List from '../common/List'
import RestaurantWrapper from '../common/RestaurantWrapper'

const Home = () => {
  const [minRating, setMinRating] = useState<number>(0)

  const [
    { loading, data, meta, err: error },
    ,
    { getPreviousPage, getNextPage, setCurrentPage }
  ] = usePagination('restaurants', {
    query: {
      filter: {
        avg_rating: ['gte', minRating]
      },
      page_size: 2
    }
  })

  console.log('data: ', data)
  console.log('Home render')

  if (loading) return null

  if (error) return <p>{error}</p>

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
      <div>Totala of {meta?.total} restaurants.</div>
      {meta?.hasPrev && <button onClick={getPreviousPage}>Prev</button>}{' '}
      {meta?.hasNext && <button onClick={getNextPage}>Next</button>}{' '}
    </div>
  )
}

export default Home
