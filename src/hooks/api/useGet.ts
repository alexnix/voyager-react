import { useState, useContext, useEffect } from 'react'
import to from 'await-to-js'
import VoyagerContext from './../../VoyagerContext'
import useAuthData from './../localStorage/useAuthData'

import {
  RequestOptions,
  RequestState,
  AuthData,
  QueryParameters,
  Cache
} from './../../types'
import VoyagerCache from '../../VoyagerCache'
import runRequestAgainstCache from './runRequestAgainstCache'
import buildEndpoint from './buildEndpoint'
import pathToResource from './pathToResource'
import produce from 'immer'

// import { Cache } from './../../types'
// type Get<T> = void => Promise
interface GetFunctionParams {
  silent?: boolean
  shouldThrow?: boolean
}
type GetFunction<T> = (params?: GetFunctionParams) => Promise<T>

const defaultQuery: QueryParameters = {
  select: [],
  page_no: 0,
  page_size: 100,
  sort_by: ['createdAt', 'desc'],
  filter: {}
}

const defaultRequestOptions: RequestOptions = {
  query: defaultQuery,
  lazy: false,
  policy: 'cache-first'
}

function useGet<T = any>(
  path: string,
  options: Partial<RequestOptions> = defaultRequestOptions
): [RequestState<T>, GetFunction<T>] {
  options = { ...defaultRequestOptions, ...options }
  const resource = pathToResource(path)

  const [authData] = useAuthData<AuthData>()
  const { url } = useContext(VoyagerContext)
  const { value: cache, setCache } = useContext(VoyagerCache)

  const [getState, setGetState] = useState<RequestState<T>>({
    loading: !options.lazy,
    called: false,
    data: null,
    meta: null,
    err: null
  })

  const endpoint = ''

  const doGet: GetFunction<T> = async function ({ silent, shouldThrow } = {}) {
    console.log('get')

    if (!silent) setGetState((prev) => ({ ...prev, loading: true }))
    const endpoint = buildEndpoint(url, resource, {
      ...defaultQuery,
      ...options.query
    })

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
      if (shouldThrow) throw new Error(err.message)
    } else {
      const data = await res?.json()
      if (res?.status === 200) {
        setGetState({
          loading: false,
          called: true,
          data: data.data,
          meta: data.meta,
          err: null
        })
        setCache((prev: Cache) =>
          produce(prev, (draft) => {
            if (draft.value[resource] === undefined) {
              draft.value[resource] = { data: [], requests: {} }
            }
            draft.value[resource].data.push(...data.data)
            draft.value[resource].requests[endpoint] = {
              queryParams: options.query as QueryParameters
            }
          })
        )
        // set cache

        return data.data
      } else {
        setGetState({
          loading: false,
          called: true,
          data: null,
          meta: null,
          err: data.message
        })
        if (shouldThrow) throw new Error(data.message)
      }
    }
  }

  const doCachedGet: GetFunction<T> = async (params) => {
    let cacheMiss = true
    if (
      options.policy === 'cache-first' ||
      options.policy === 'cache-and-network'
    ) {
      if (cache[resource]?.requests[endpoint]) {
        const [valid, data] = runRequestAgainstCache(
          resource,
          buildEndpoint(url, resource, { ...defaultQuery, ...options.query }),
          cache[resource].data,
          { ...defaultQuery, ...options.query }
        )
        if (valid) {
          cacheMiss = false
          setGetState((prev) => ({ ...prev, data }))
          return data
        }
      }
    }
    console.log(options.policy, cacheMiss)

    if (
      (options.policy === 'cache-first' && cacheMiss) ||
      options.policy === 'cache-and-network' ||
      options.policy === 'network-first' ||
      options.policy === 'no-cache'
    ) {
      const [err, data] = await to(doGet(params))
      if (err) throw err
      else return data
      // doGet({ query: query })
    }
  }

  // cache-first: check in cache and if found don`t do anything else do netowrk
  // cache-and-network: check cache and then do netowrk, regardless
  // netowrk-fist: do netowrk without checking cache, and cache the result
  // no-cahce: do netowrk and don`t cache result

  useEffect(() => {
    if (!options.lazy) {
      doCachedGet({ silent: false, shouldThrow: false })
    }
  }, [/*options.query,*/ authData])

  useEffect(() => {
    if (options.policy !== 'no-cache') {
      if (cache[resource]?.data) {
        const [, data] = runRequestAgainstCache(
          resource,
          buildEndpoint(url, resource, { ...defaultQuery, ...options.query }),
          cache[resource],
          { ...defaultQuery, ...options.query }
        )
        console.log(data)

        setGetState((prev) => ({
          ...prev,
          data
        }))
      }

      // setGetState({
      //   loading: false,
      //   err: null,
      //   data: [1]
      // })
      // setGetState((prev) => ({
      //   ...prev,
      //   data: runRequestAgainstCache(
      //     resource,
      //     buildEndpoint(url, resource, { ...defaultQuery, ...options.query })
      //     cache[resource].data,
      //     { ...defaultQuery, ...options.query }
      //   )
      // }))
      // does this need to check for deep equality?
      // if (getState.data !== cache[endpoint]) {
      //   setGetState((prev) => ({ ...prev, data: cache[endpoint] }))
      // }
    }
  }, [cache])

  return [getState, doCachedGet]
}

export default useGet
