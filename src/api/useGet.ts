import { useState, useContext, useEffect } from 'react'
import produce from 'immer'
import to from 'await-to-js'
import VoyagerContext from './../VoyagerContext'
import useAuthData from './../localStorage/useAuthData'
import {
  RequestOptions,
  RequestState,
  AuthData,
  QueryParameters,
  Cache,
  GetFunction
} from './../types'
import {
  defaultQuery,
  defaultRequestOptions,
  initRequestState
} from './defaults'
import VoyagerCache from '../VoyagerCache'
import runRequestAgainstCache from './runRequestAgainstCache'
import buildEndpoint from './buildEndpoint'
import doNetwork from './doNetowrk'

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
  const [started, setStarted] = useState(false)

  const [resource, id] = path.split('/')
  const endpoint = !id
    ? buildEndpoint(url, resource, options.query as QueryParameters)
    : `${url}/${path}`

  const sorting = `${options.query?.sort_by![0]}:${options.query?.sort_by![1]}`

  // TODO: is this really needed as a functionality?
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
          // TODO maybe remote the .data .meta stuff
          // only return data and create a /count endpoint to get the total
          // then infer hasNext and havePrev
          const dup: any = draft.value[resource].data.find(
            (j: any) => j._id === data.data._id
          )
          if (dup) {
            for (const [k, v] of Object.entries(data.data)) {
              dup[k] = v
            }
          } else {
            data.data._sortings = []
            draft.value[resource].data.push(data.data)
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

    setStarted(true)
    const [err, res] = await to(doNetwork('GET', endpoint, authData?.token))
    setStarted(false)

    if (err) {
      setGetState({
        loading: false,
        called: true,
        data: null,
        meta: null,
        err: err.message
      })
      return null
    } else {
      setGetState({
        loading: false,
        called: true,
        data: res.data,
        meta: res.meta,
        err: null
      })
      addToChace(res)
      return res
    }
  }

  // cache-first: check in cache and if found don`t do anything else do netowrk
  // cache-and-network: check cache and then do netowrk, regardless
  // netowrk-fist: do netowrk without checking cache, and cache the result
  // no-cahce: do netowrk and don`t cache result

  const doCachedGet: GetFunction<T> = async (
    params = { silent: false, policy: options.policy }
  ) => {
    params = { silent: false, policy: options.policy, ...params }

    const { policy } = params
    let cacheMiss = true
    let ret: T | null = null

    if (policy === 'cache-first' || policy === 'cache-and-network') {
      const [valid, data, meta] = runRequestAgainstCache(
        resource,
        endpoint,
        cache,
        options.query as QueryParameters,
        id,
        options.spawnFromCache!
      )
      if (valid) {
        cacheMiss = false
        setGetState({
          err: null,
          called: true,
          loading: false,
          data,
          meta
        })
        ret = data
      }
      // else if (options.spawnFromCache && id) {
      //   const hookData = cache[resource]?.data.find((i: any) => i._id === id)
      //   if (hookData) {
      //     cacheMiss = false
      //     setGetState({
      //       err: null,
      //       called: true,
      //       loading: false,
      //       data: (hookData as unknown) as T
      //     })
      //   }
      // }
    }

    if (
      (policy === 'cache-first' && cacheMiss) ||
      policy === 'cache-and-network' ||
      policy === 'network-first' ||
      policy === 'no-cache'
    ) {
      return doGet(params)
    } else {
      return ret as T
    }
  }

  useEffect(() => {
    if (!options.lazy && options.skipUntil && !started) {
      doCachedGet({ silent: false, policy: options.policy })
    }
  }, [JSON.stringify(options.query), authData, options.skipUntil])

  useEffect(() => {
    if (options.policy !== 'no-cache') {
      let [valid, data, meta] = runRequestAgainstCache(
        resource,
        endpoint,
        cache,
        options.query as QueryParameters,
        id,
        options.spawnFromCache!
      )
      if (valid) {
        // if (id) {
        //   console.log("resource, endpoint: ", resource, endpoint)
        //   console.log("data: ", data)
        //   data = data[0]
        // }
        // TODO check if the data is actually different before setting it again
        setGetState((prev) => ({
          ...prev,
          data,
          meta
        }))
      }
    }
  }, [cache[resource]])

  return [getState, doCachedGet]
}

export default useGet
