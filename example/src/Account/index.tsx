import React from 'react'
import { useGet, useUser, usePost } from 'voyager'

interface AccountProps {}

const Account: React.FC<AccountProps> = () => {
  const user = useUser()

  const [{ loading, data }] = useGet('restaurants', {
    query: {
      filter: {
        owner: ['eq', user!._id]
      }
    }
  })

  // const [{ loading: reviewsLoading, data: reviewsData }] = useGet('reviews', {
  //   skipUntil: data,
  //   query: {
  //     filter: {
  //       restaurant: ['in', data?.map((r: any) => r._id)],
  //       reply_of_owner: ['eq', null]
  //     }
  //   }
  // })

  const [, createRestaurant] = usePost('restaurants')

  // console.log('reviewsLoading, reviewsData: ', reviewsLoading, reviewsData)

  if (loading) return <p>Loading</p>

  return (
    <div>
      <button onClick={() => createRestaurant({ body: { name: 'hi' } })}>
        Add New
      </button>
      <div>
        {data.map((r: any) => (
          <div key={r._id}>{r.name}</div>
        ))}
      </div>
    </div>
  )
}

export default Account
