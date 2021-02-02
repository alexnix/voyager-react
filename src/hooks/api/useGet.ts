import { useState, useContext, useEffect } from 'react'
import produce from 'immer'
import to from 'await-to-js'
import VoyagerContext from './../../VoyagerContext'
import useAuthData from './../localStorage/useAuthData'
import {
  RequestOptions,
  RequestState,
  AuthData,
  QueryParameters,
  Cache,
  Meta
} from './../../types'
import {
  defaultQuery,
  defaultRequestOptions,
  initRequestState
} from './defaults'
import VoyagerCache from '../../VoyagerCache'
import runRequestAgainstCache from './runRequestAgainstCache'
import buildEndpoint from './buildEndpoint'
// import pathToResource from './pathToResource'

interface GetFunctionParams {
  silent?: boolean
}
type GetFunction<T> = (params?: GetFunctionParams) => Promise<T>

function useGet<T = any>(
  path: string,
  options: Partial<RequestOptions> = defaultRequestOptions
): [RequestState<T>, GetFunction<T>] {
  options = { ...defaultRequestOptions, ...options }
  options.query = { ...defaultQuery, ...options.query } as QueryParameters

  const [authData] = useAuthData<AuthData>()
  const { url } = useContext(VoyagerContext)
  const { value: cache, setCache } = useContext(VoyagerCache)

  const [getState, setGetState] = useState<RequestState<T>>(
    initRequestState(options.lazy!)
  )

  const [resource, id] = path.split('/')
  const endpoint = !id
    ? buildEndpoint(url, resource, options.query as QueryParameters)
    : `${url}/${path}`

  const sorting = `${options.query?.sort_by![0]}:${options.query?.sort_by![1]}`

  if (options.strictSoring) {
    options.query!.filter!._sortings = ['in', [sorting]]
  }

  function addToChace(data: any) {
    setCache((prev: Cache) =>
      produce(prev, (draft) => {
        if (draft.value[resource] === undefined) {
          draft.value[resource] = { data: [], requests: {} }
        }
        if (id) {
          const dup: any = draft.value[resource].data.find(
            (j: any) => j._id === data._id
          )
          if (dup) {
            // TODO
          } else {
            data._sortings = []
            draft.value[resource].data.push(data)
          }
        } else {
          data.data.forEach((i: any) => {
            i._sortings = [sorting]
            const dup: any = draft.value[resource].data.find(
              (j: any) => j._id === i._id
            )
            if (!dup) {
              draft.value[resource].data.push(i)
            } else if (dup && !dup._sortings.includes(sorting)) {
              dup._sortings.push(sorting)
            }
          })
        }
        draft.value[resource].requests[endpoint] = {
          queryParams: options.query as QueryParameters,
          meta: data.meta
        }
      })
    )
  }

  const doGet: GetFunction<T> = async function ({ silent } = {}) {
    if (!silent) setGetState((prev) => ({ ...prev, loading: true }))

    const [err, res] = await to(
      fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authData?.token}`
        }
      })
    )
    if (err) {
      setGetState({
        loading: false,
        called: true,
        data: null,
        meta: null,
        err: err.message
      })
    } else {
      const data = await res?.json()
      if (res?.status === 200) {
        const hookData = id ? data : data.data
        const hookMeta = id ? undefined : data.meta
        setGetState({
          loading: false,
          called: true,
          data: hookData,
          meta: hookMeta,
          err: null
        })
        addToChace(data)
        return data.data
      } else {
        setGetState({
          loading: false,
          called: true,
          data: null,
          meta: null,
          err: data.message
        })
      }
    }
  }

  // cache-first: check in cache and if found don`t do anything else do netowrk
  // cache-and-network: check cache and then do netowrk, regardless
  // netowrk-fist: do netowrk without checking cache, and cache the result
  // no-cahce: do netowrk and don`t cache result

  const doCachedGet: GetFunction<T> = async (params) => {
    let cacheMiss = true
    if (
      options.policy === 'cache-first' ||
      options.policy === 'cache-and-network'
    ) {
      const [valid, data] = runRequestAgainstCache(
        resource,
        endpoint,
        cache,
        options.query as QueryParameters
      )
      if (valid) {
        cacheMiss = false
        setGetState({
          err: null,
          called: true,
          loading: false,
          data,
          meta: cache[resource]?.requests[endpoint].meta
        })
        return data
      } else if (options.spawnFromCache && id) {
        const hookData = cache[resource]?.data.find((i: any) => i._id === id)
        if (hookData) {
          cacheMiss = false
          setGetState({
            err: null,
            called: true,
            loading: false,
            data: (hookData as unknown) as T
          })
        }
      }
    }

    if (
      (options.policy === 'cache-first' && cacheMiss) ||
      options.policy === 'cache-and-network' ||
      options.policy === 'network-first' ||
      options.policy === 'no-cache'
    ) {
      doGet(params)
    }
  }

  useEffect(() => {
    if (!options.lazy && options.skipUntil) {
      doCachedGet({ silent: false })
    }
  }, [JSON.stringify(options.query), authData, options.skipUntil])

  useEffect(() => {
    if (options.policy !== 'no-cache') {
      let [valid, data] = runRequestAgainstCache(resource, endpoint, cache, {
        ...defaultQuery,
        ...options.query
      })
      if (valid) {
        if (id) {
          data = data[0]
        }
        setGetState((prev) => ({
          ...prev,
          data,
          meta: { ...prev.meta, total: data.length } as Meta
        }))
      }
    }
  }, [cache])

  return [getState, doCachedGet]
}

export default useGet
