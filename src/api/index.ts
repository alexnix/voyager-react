import useGet from './useGet'
import { useContext, useReducer } from 'react'
import VoyagerContext from '../VoyagerContext'
import VoyagerCache from '../VoyagerCache'
import to from 'await-to-js'
import produce from 'immer'
import doNetwork from './../util/doNetowrk'
import { itemMatchedFilters } from './runRequestAgainstCache'

import type { RequestState } from './../typings'

type HookRunFunction<T> = (params: { id?: string; body?: object }) => Promise<T>

const initalizer: RequestState = {
  loading: false,
  called: false,
  data: null,
  err: null
}

type Action =
  | { type: 'START' }
  | { type: 'SUCCESS'; payload: any }
  | { type: 'ERROR'; payload: string }

const reducer = (state: RequestState, action: Action): RequestState =>
  produce(state, (draft) => {
    switch (action.type) {
      case 'START': {
        draft.loading = true
        return draft
      }
      case 'SUCCESS': {
        draft.loading = false
        draft.called = true
        draft.err = null
        draft.data = action.payload
        return draft
      }
      case 'ERROR': {
        draft.loading = false
        draft.called = true
        draft.data = null
        draft.err = action.payload
        return draft
      }
      default:
        throw Error('Unhandled action type.')
    }
  })

const apiHook = (verb: 'POST' | 'PUT' | 'DELETE') => <T>(
  path: string
): [RequestState, HookRunFunction<T>] => {
  const [gResource] = path.split('/')

  const { url, cacheObservers } = useContext(VoyagerContext)
  const { setCache } = useContext(VoyagerCache)

  const [requestState, dispatch] = useReducer(reducer, initalizer)

  function updateCacheAfterDelete(resource: string, data: any) {
    setCache!((prev) =>
      produce(prev, (draft) => {
        draft[resource].data = draft[resource].data.filter(
          (i: any) => i._id !== data._id
        )
        Object.values(draft[resource].requests).forEach((r: any) => {
          if (itemMatchedFilters(data, r.queryParams.filter)) {
            r.meta.total -= 1
            if (
              r.queryParams.page_size * (r.queryParams.page_no + 1) >=
              r.meta.total
            ) {
              r.meta.hasNext = false
            }
          }
        })
      })
    )
  }

  function updateCacheAfterPost(resource: string, data: any) {
    setCache!((prev) =>
      produce(prev, (draft) => {
        draft[resource].data.push({ ...data, _sortings: [] })
        Object.values(draft[resource].requests).forEach((r: any) => {
          if (itemMatchedFilters(data, r.queryParams.filter)) {
            r.meta.total += 1
            if (
              r.queryParams.page_size * (r.queryParams.page_no + 1) <
              r.meta.total
            ) {
              r.meta.hasNext = true
            }
          }
        })
      })
    )
  }

  function updateCacheAfterPut(resource: string, data: any) {
    setCache!((prev) =>
      produce(prev, (draft) => {
        draft[resource].data = [
          ...draft[resource].data.filter((i: any) => i._id !== data._id),
          data
        ]
      })
    )
  }

  const updateCache = (data: any, verb: string) => {
    const update = {
      post: updateCacheAfterPost,
      put: updateCacheAfterPut,
      delete: updateCacheAfterDelete
    }

    const notifyObservers = (verb: string, data: any, resource: string) => {
      cacheObservers?.forEach((o) =>
        o(verb as 'post' | 'put' | 'delete', data, resource)
      )
    }

    if (data._voyager_api) {
      ;['post', 'put', 'delete'].forEach((verb) => {
        if (data[verb]) {
          for (const [resource, value] of Object.entries(data[verb])) {
            if (value instanceof Array) {
              for (const item of value as any[]) {
                update[verb](resource, item)
                notifyObservers(verb, item, resource)
              }
            } else {
              update[verb](resource, value)
              notifyObservers(verb, value, resource)
            }
          }
        }
      })
    } else {
      update[verb.toLowerCase()](gResource, data)
      notifyObservers(verb.toLowerCase(), data, gResource)
    }
  }

  const run: HookRunFunction<T> = async ({ id, body }) => {
    dispatch({ type: 'START' })
    let endpoint: string

    endpoint = `${url}/${gResource}`
    if (id) endpoint += `/${id}`

    const [err, res] = await to(doNetwork(verb, endpoint, body))

    if (err) {
      dispatch({ type: 'ERROR', payload: err.message })
      return null
    }

    updateCache(res, verb)
    dispatch({ type: 'SUCCESS', payload: res })
    return res
  }

  return [requestState, run]
}

const usePost = apiHook('POST')
const usePut = apiHook('PUT')
const useDetlete = apiHook('DELETE')

export { usePost, usePut, useDetlete, useGet }
