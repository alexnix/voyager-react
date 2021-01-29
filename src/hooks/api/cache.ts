import produce from 'immer'
import { QueryParameters, Cache, VoyagerGetResult } from '../../types'

const addToCache = (
  d: VoyagerGetResult<any>,
  resource: string,
  query: QueryParameters
) => (prev: Cache) =>
  produce(prev, (draft) => {
    const cacheEntry = {
      queryParams: query,
      response: d
    }
    if (draft.value[resource] === undefined) {
      draft.value[resource] = [cacheEntry]
    } else {
      draft.value[resource].push(cacheEntry)
    }
  })

export { addToCache }
