import useGet from './useGet'
import { RequestState, AuthData, Cache } from '../types'
import { useContext, useState } from 'react'
import VoyagerContext from '../VoyagerContext'
import VoyagerCache from '../VoyagerCache'
import useAuthData from '../localStorage/useAuthData'
import to from 'await-to-js'
import produce from 'immer'
import doNetwork from './doNetowrk'
import { itemMatchedFilters } from './runRequestAgainstCache'

type HookRunFunction<T> = (params: { id?: string; body?: object }) => Promise<T>

const apiHook = (verb: 'POST' | 'PUT' | 'DELETE') => <T>(
  path: string
): [RequestState, HookRunFunction<T>] => {
  const [gResource] = path.split('/')

  const { url } = useContext(VoyagerContext)
  const { setCache } = useContext(VoyagerCache)
  const [authData] = useAuthData<AuthData>()

  const [requestState, setRequestState] = useState<RequestState<T>>({
    loading: false,
    called: false,
    data: null,
    err: null
  })

  function updateCacheAfterDelete(resource: string, data: any) {
    setCache((prev: Cache) =>
      produce(prev, (draft) => {
        draft.value[resource].data = draft.value[resource].data.filter(
          (i: any) => i._id !== data._id
        )
        Object.values(draft.value[resource].requests).forEach((r) => {
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
    setCache((prev: Cache) =>
      produce(prev, (draft) => {
        draft.value[resource].data.push({ ...data, _sortings: [] })
        Object.values(draft.value[resource].requests).forEach((r) => {
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
    setCache((prev: Cache) =>
      produce(prev, (draft) => {
        draft.value[resource].data = [
          ...draft.value[resource].data.filter((i: any) => i._id !== data._id),
          data
        ]
      })
    )
  }

  const updateCache = (data: any, verb: string) => {
    const update = {
      POST: updateCacheAfterPost,
      PUT: updateCacheAfterPut,
      DELETE: updateCacheAfterDelete
    }[verb]

    if (data._voyager_api) {
      const updates = Object.entries(data.result).filter(
        ([k]) => k !== '_voyager_api'
      )
      for (const [resource, value] of updates) {
        if (value instanceof Array) {
          for (const item of value as any[]) {
            update(resource, item)
          }
        } else {
          update(resource, value)
        }
      }
    } else {
      update(gResource, data)
    }
  }

  const run: HookRunFunction<T> = async ({ id, body }) => {
    setRequestState({ loading: true, data: null, err: null })
    let endpoint: string

    endpoint = `${url}/${gResource}`
    if (id) endpoint += `/${id}`

    const [err, res] = await to(
      doNetwork(verb, endpoint, authData?.token, body)
    )
    if (err) {
      setRequestState({
        loading: false,
        called: true,
        data: null,
        err: err.message,
        meta: null
      })
      return null
    } else {
      updateCache(res, verb)
      setRequestState({
        loading: false,
        called: true,
        data: res,
        err: null,
        meta: null
      })
      return res
    }

    // const [err, res] = await to(
    //   fetch(endpoint, {
    //     method: verb,
    //     body: JSON.stringify(body),
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${authData?.token}`
    //     }
    //   })
    // )
    //
    // if (err) {
    //   setRequestState({ loading: false, data: null, err: err.message })
    // } else {
    //   const data = await res?.json()
    //   if (res?.status === 200) {
    //     updateCache[verb](data)
    //     setRequestState({ loading: false, data, err: null })
    //     return data
    //   } else {
    //     setRequestState({ loading: false, data: null, err: data.message })
    //   }
    // }
  }

  return [requestState, run]
}

const usePost = apiHook('POST')
const usePut = apiHook('PUT')
const useDetlete = apiHook('DELETE')

export { usePost, usePut, useDetlete, useGet }
