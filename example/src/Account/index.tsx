import React from 'react'
import { useGet, useUser } from 'voyager-react'
import { useOpen } from '../modal'
import CreateRestaurant from './CreateRestaurant'
import List from '../common/List'
import RestaurantWrapper from '../common/RestaurantWrapper'

interface AccountProps {}

const Account: React.FC<AccountProps> = () => {
  const user = useUser()

  const openModal = useOpen()

  const [{ loading, data }] = useGet('restaurants', {
    query: {
      filter: {
        owner: ['eq', user!._id]
      }
    }
  })

  const [{ loading: reviewsLoading, data: reviewsData }] = useGet('reviews', {
    skipUntil: data,
    query: {
      filter: {
        restaurant: ['in', data?.map((r: any) => r._id)],
        reply_of_owner: ['eq', null]
      }
    }
  })
  console.log('reviewsLoading, reviewsData: ', reviewsLoading, reviewsData)

  if (loading) return <p>Loading</p>

  return (
    <div>
      <h1>Account Page</h1>
      <button
        onClick={() =>
          openModal(<CreateRestaurant />, {
            style: 'my'
          })
        }
      >
        Add New
      </button>
      <div>
        <List elements={data} ElementItem={RestaurantWrapper} />
      </div>
    </div>
  )
}

export default Account
