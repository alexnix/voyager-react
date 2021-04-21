import { useState, useContext, useEffect, useCallback, useReducer } from 'react'
import produce from 'immer'
import to from 'await-to-js'
import VoyagerContext from './../VoyagerContext'
import {
  defaultQuery,
  defaultRequestOptions,
  initRequestState
} from './../util/defaults'
import VoyagerCache from '../VoyagerCache'
import runRequestAgainstCache from './runRequestAgainstCache'
import doNetwork from './../util/doNetowrk'
import deepEqual from './../util/deepEqual'

import type {
  RequestOptions,
  RequestState,
  QueryParameters,
  GetFunction,
  VoyagerContext_t
} from './../typings'

type Action =
  | { type: 'START' }
  | { type: 'SUCCESS1'; payload: any }
  | { type: 'SUCCESS2'; payload: any }
  | { type: 'SUCCESS3'; payload: any }
  | { type: 'ERROR'; payload: string }

const reducer = (state: RequestState, action: Action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case 'START': {
        draft.loading = true
        return draft
      }
      case 'SUCCESS1':
      case 'SUCCESS2': {
        draft.loading = false
        draft.called = true
        draft.data = action.payload.data
        draft.meta = action.payload.meta
        return draft
      }
      case 'SUCCESS3': {
        if (action.payload.data) draft.data = action.payload.data
        if (action.payload.meta) draft.meta = action.payload.meta
        return draft
      }
      case 'ERROR': {
        draft.loading = false
        draft.called = true
        draft.data = draft.meta = null
        draft.err = action.payload
        return draft
      }
      default:
        throw Error('Unhandled action type.')
    }
  })

function useGet<T = any>(
  path: string,
  options: Partial<RequestOptions> = defaultRequestOptions
): [RequestState<T>, GetFunction<T>] {
  options = { ...defaultRequestOptions, ...options }
  options.query = { ...defaultQuery, ...options.query } as QueryParameters

  const {
    client: { url, auth, connector },
    cacheObservers
  } = useContext(VoyagerContext) as VoyagerContext_t
  const { cache, dispatchCacheEvent } = useContext(VoyagerCache)

  const [getState, dispatch] = useReducer(
    reducer,
    initRequestState(options.lazy!)
  )
  const [started, setStarted] = useState(false)

  const [resource, id] = path.split('/')
  const endpoint = !id
    ? connector.buildEndpoint(url, resource, options.query as QueryParameters)
    : `${url}/${path}`

  const runAgainstCache = () =>
    runRequestAgainstCache(
      resource,
      endpoint,
      cache,
      options.query as QueryParameters,
      id,
      options.spawnFromCache!
    )

  const doGet: GetFunction<T> = async function ({ silent } = {}) {
    if (!silent) dispatch({ type: 'START' })

    setStarted(true)
    const [err, res] = await to(doNetwork('GET', endpoint, undefined, auth))
    setStarted(false)

    if (err) {
      dispatch({ type: 'ERROR', payload: err.message })
      return null
    }

    const [errUnpack, data] = await to(connector.unpackQueryResult(res))
    if (errUnpack) {
      dispatch({ type: 'ERROR', payload: errUnpack.message })
      return null
    }

    dispatchCacheEvent!({
      type: 'GET',
      payload: {
        resource,
        endpoint,
        id,
        data,
        queryParams: options.query as QueryParameters
      }
    })
    dispatch({ type: 'SUCCESS1', payload: res })

    return res
  }

  // cache-first: check in cache and if found don`t do anything else do netowrk
  // cache-and-network: check cache and then do netowrk, regardless
  // netowrk-fist: do netowrk without checking cache, and cache the result
  // no-cahce: do netowrk and don`t cache result

  const doCachedGet: GetFunction<T> = useCallback(
    async (params = { silent: false, policy: options.policy }) => {
      params = { silent: false, policy: options.policy, ...params }

      const { policy } = params
      let cacheMiss = true
      let ret: T | null = null

      if (policy === 'cache-first' || policy === 'cache-and-network') {
        const [valid, data, meta] = runAgainstCache()
        if (valid) {
          cacheMiss = false
          dispatch({ type: 'SUCCESS2', payload: { data, meta } })
          ret = data
        }
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
    },
    [
      cacheObservers?.length,
      cache[resource],
      JSON.stringify(options.query),
      options.spawnFromCache
    ]
  )

  useEffect(() => {
    if (!options.lazy && options.skipUntil && !started) {
      doCachedGet({ silent: false, policy: options.policy })
    }
  }, [JSON.stringify(options.query), options.skipUntil])

  useEffect(() => {
    if (options.policy !== 'no-cache') {
      let [valid, data, meta] = runAgainstCache()
      if (!valid) {
        return
      }
      const update = {}
      let anyUpdate = false
      if (!deepEqual((getState.data as unknown) as object, data)) {
        update['data'] = data
        anyUpdate = true
      }
      if (!deepEqual((getState.meta as unknown) as object, meta as object)) {
        update['meta'] = meta
        anyUpdate = true
      }
      if (anyUpdate) {
        dispatch({ type: 'SUCCESS3', payload: update })
      }
    }
  }, [cache[resource]])

  return [getState, doCachedGet]
}

export default useGet
