import React, {
  createContext,
  ReactNode,
  useReducer,
  useContext,
  FC,
  useMemo
} from 'react'
import type { CacheContext, CacheReducerAction, ResourceCache } from './typings'

import produce from 'immer'
import type { CacheValue } from './typings'
import VoyagerContext from './VoyagerContext'
import findById from './util/findById'
import runRequestAgainstCache, {
  itemMatchedFilters
} from './api/runRequestAgainstCache'

const defaultContext: CacheContext = {
  cache: {}
}

const VoyagerCache = createContext(defaultContext)

interface VoyagerCacheProviderProps {
  children: ReactNode
}

type ReducerFactory = (
  notify: any
) => (state: CacheValue, action: CacheReducerAction) => CacheValue

const reducerFactory: ReducerFactory = (notifyObservers: any) => (
  state: CacheValue,
  action: CacheReducerAction
) =>
  produce(state, (draft) => {
    switch (action.type) {
      case 'GET': {
        const { resource, id, endpoint, data, queryParams } = action.payload
        if (!draft[resource]) {
          const resourceCache: ResourceCache = {
            data: [],
            requests: {}
          }
          draft[resource] = resourceCache
        }

        if (id) {
          const dup = findById(draft[resource].data, data.data._id)
          if (dup) {
            for (const [k, v] of Object.entries(data.data)) {
              dup[k] = v
            }
          } else {
            draft[resource].data.push(data.data)
            notifyObservers('get', [data.data], resource)
          }
        } else {
          data.data.forEach((i: any) => {
            const dup = findById(draft[resource].data, i._id)
            if (dup) {
              for (const [k, v] of Object.entries(i)) {
                dup[k] = v
              }
            } else {
              draft[resource].data.push(i)
            }
          })

          // Run same exact request on cahce, if any returned item
          // is not int he new data then it must have changed
          // We cannot now *how* it changed so we will just remove item
          // Other requests that might have depended on it will thus become invalid
          // and will be refetched when needed
          const [valid, prevData] = runRequestAgainstCache(
            resource,
            endpoint,
            state,
            queryParams,
            '',
            false
          )
          if (valid) {
            prevData.forEach((i: any) => {
              if (
                itemMatchedFilters(i, queryParams.filter) &&
                !findById(data.data, i._id)
              ) {
                draft[resource].data.splice(draft[resource].data.indexOf(i), 1)
              }
            })
          }
          notifyObservers('get', data.data, resource)
          // const newItems = data.data.filter(
          //   (i: any) => !findById(draft[resource].data, i._id)
          // )
          // draft[resource].data.push(...newItems)
          // notifyObservers('get', newItems, resource)
        }

        draft[resource].requests[endpoint] = {
          queryParams,
          meta: data.meta
        }
        return draft
      }
      case 'POST': {
        const { resource, data } = action.payload
        if (!draft[resource]) {
          const resourceCache: ResourceCache = {
            data: [],
            requests: {}
          }
          draft[resource] = resourceCache
        }

        draft[resource].data.push(...data)

        notifyObservers('post', data, resource)

        Object.values(draft[resource].requests).forEach((r: any) => {
          const cntItemsMatchedFilters = data.filter((i: any) =>
            itemMatchedFilters(i, r.queryParams.filter)
          ).length

          if (cntItemsMatchedFilters > 0) {
            r.meta.total += cntItemsMatchedFilters
            if (
              r.queryParams.page_size * (r.queryParams.page_no + 1) <
              r.meta.total
            ) {
              r.meta.hasNext = true
            }
          }
        })
        return draft
      }
      case 'PUT': {
        const { resource, data } = action.payload
        if (!draft[resource]) {
          const resourceCache: ResourceCache = {
            data: [],
            requests: {}
          }
          draft[resource] = resourceCache
        }

        draft[resource].data = [
          ...draft[resource].data.filter((i: any) => !findById(data, i._id)),
          ...data
        ]
        notifyObservers('put', data, resource)
        return draft
      }
      case 'DELETE': {
        const { resource, data } = action.payload
        if (!draft[resource]) {
          const resourceCache: ResourceCache = {
            data: [],
            requests: {}
          }
          draft[resource] = resourceCache
        }

        // Remove deleted items from cache
        draft[resource].data = draft[resource].data.filter(
          (i: any) => !findById(data, i._id)
        )

        notifyObservers('delete', data, resource)

        // Update total and hasNext fields for each request
        Object.values(draft[resource].requests).forEach((r: any) => {
          const cntItemsMatchedFilters = data.filter((i: any) =>
            itemMatchedFilters(i, r.queryParams.filter)
          ).length
          if (cntItemsMatchedFilters > 0) {
            r.meta.total -= cntItemsMatchedFilters
            if (
              r.queryParams.page_size * (r.queryParams.page_no + 1) >=
              r.meta.total
            ) {
              r.meta.hasNext = false
            }
          }
        })
        return draft
      }
      case 'MANUAL_EDIT':
        draft = action.payload
        return draft
      default:
        throw new Error('Un-handled action type.')
    }
  })

const VoyagerCacheProvider: FC<VoyagerCacheProviderProps> = ({ children }) => {
  const { cacheObservers } = useContext(VoyagerContext)

  const reducer = useMemo(() => {
    const notifyObservers = (verb: string, data: any, resource: string) => {
      cacheObservers?.forEach((o) =>
        o(verb as 'get' | 'post' | 'put' | 'delete', data, resource)
      )
    }
    return reducerFactory(notifyObservers)
  }, [cacheObservers])

  const [cache, dispatchCacheEvent] = useReducer(reducer, {})

  return (
    <VoyagerCache.Provider value={{ cache, dispatchCacheEvent }}>
      {children}
    </VoyagerCache.Provider>
  )
}

export { VoyagerCacheProvider }
export default VoyagerCache
