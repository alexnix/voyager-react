import { useState, useContext, useEffect } from 'react'
import VoyagerContext from './../../VoyagerContext'
import useAuthData from './../localStorage/useAuthData'

import { RequestOptions, RequestState, AuthData } from './../../types'
import VoyagerCache from '../../VoyagerCache'

import { Cache } from './../../types'

function buildEndpoint(
  url: string,
  resource: string,
  options: RequestOptions | undefined
): string {
  let endpoint
  if (resource.startsWith('http')) {
    return resource
  } else {
    endpoint = `${url}/${resource}`
    if (options?.query) {
      endpoint += '?'
      if (options.query.select) {
        endpoint += `select=${options.query.select.join(',')}&`
      }
      if (options.query.where && options.query.op && options.query.rhs) {
        endpoint += `where=${options.query.where}&op=$${options.query.op}&rhs=${options.query.rhs}&`
      }
      if (options.query.sort) {
        endpoint += `sort=${options.query.sort}&`
      }
      if (options.query.order) {
        endpoint += `order=${options.query.order}&`
      }
      if (options.query.page_size) {
        endpoint += `page_size=${options.query.page_size}&`
      }
      if (options.query.page_no) {
        endpoint += `page_no=${options.query.page_no}`
      }
    }
    return endpoint
  }
}

function useGet<T = any>(
  resource: string,
  options?: RequestOptions
): RequestState<T> {
  const { url } = useContext(VoyagerContext)
  const { value: cache, setCache } = useContext(VoyagerCache)
  const [authData] = useAuthData<AuthData>()

  const [getState, setGetState] = useState<RequestState<T>>({
    loading: true,
    data: null,
    meta: null,
    err: null
  })

  const endpoint = buildEndpoint(url, resource, options)

  useEffect(() => {
    // This is called twice on initial load
    // once to do the actuall fetch
    // second because of the cache firts update
    // TODO fix this

    if (cache[resource]) {
      setGetState({
        loading: false,
        data: cache[resource].data as T,
        meta: cache[resource].meta,
        err: null
      })
    } else {
      fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authData?.token}`
        }
      })
        .then((r) => {
          if (r.status === 200) {
            return r.json()
          } else {
            throw Error(r.statusText)
          }
        })
        .then((d) => {
          setCache!((prev: Cache) => ({
            ...prev,
            value: { ...prev.value, [resource]: d }
          }))
          setGetState({
            loading: false,
            data: d.data,
            meta: d.meta,
            err: null
          })
        })
        .catch((e) => {
          setGetState({ loading: false, data: null, err: e.message })
        })
    }
  }, [cache])

  return getState
}

export default useGet
