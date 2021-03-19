import React from 'react'
import { useCache } from 'voyager-react'
import produce from 'immer'

interface UpdateCacheProps {
  restaurantId: string
}

const UpdateCache: React.FC<UpdateCacheProps> = ({ restaurantId }) => {
  const [cache, setCache] = useCache()

  const updateRestaurantNameInCache = () => {
    setCache(
      produce(cache, (draft: any) => {
        console.log('prev: ', cache)
        const r = draft['restaurants'].data.find(
          (r: any) => r._id === restaurantId
        )
        r.name = 'hihihiiihi'
      })
    )
  }

  return (
    <button onClick={updateRestaurantNameInCache}>
      updateRestaurantNameInCache
    </button>
  )
}

export default UpdateCache
