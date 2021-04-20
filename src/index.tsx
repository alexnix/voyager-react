import * as React from 'react'

import VoyagerContext from './VoyagerContext'
import VoyagerCache, { VoyagerCacheProvider } from './VoyagerCache'

import { useGet, usePost, usePut, useDetlete } from './api'
import usePagination from './api/usePagination'

import type { VoyagerProviderProps, CacheValue, CacheObserver } from './typings'

const VoyagerProvider = ({ url, auth, children }: VoyagerProviderProps) => {
  const [cacheObservers, setCacheObservers] = React.useState<CacheObserver[]>(
    []
  )
  return (
    <VoyagerContext.Provider
      value={{ url, auth, cacheObservers, setCacheObservers }}
    >
      <VoyagerCacheProvider>{children}</VoyagerCacheProvider>
    </VoyagerContext.Provider>
  )
}

const useCache: () => [CacheValue, (newCache: CacheValue) => void] = () => {
  const { cache, dispatchCacheEvent } = React.useContext(VoyagerCache)

  const userSetCache = (newCache: CacheValue) => {
    dispatchCacheEvent!({ type: 'MANUAL_EDIT', payload: newCache })
  }

  return [cache, userSetCache]
}

const useCacheObserver = (observer: CacheObserver) => {
  const { setCacheObservers } = React.useContext(VoyagerContext)

  React.useEffect(() => {
    setCacheObservers!((prev) => [...prev, observer])

    return () =>
      setCacheObservers!((prev) => prev.filter((i) => i !== observer))
  }, [observer])
}

export {
  VoyagerProvider,
  useGet,
  usePost,
  usePut,
  useDetlete,
  usePagination,
  useCache,
  useCacheObserver
}
