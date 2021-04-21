import * as React from 'react'

import VoyagerContext from './VoyagerContext'
import VoyagerCache, { VoyagerCacheProvider } from './VoyagerCache'
import * as Connectors from './api/connectors'

import { useGet, usePost, usePut, useDetlete } from './api'
import usePagination from './api/usePagination'

import type {
  VoyagerProviderProps,
  CacheValue,
  CacheObserver,
  APIConnector
} from './typings'

const VoyagerProvider = ({
  children,
  client: { url, auth, connector = {} }
}: VoyagerProviderProps) => {
  connector = { ...connector, ...Connectors.VoyagerServer }

  const [cacheObservers, setCacheObservers] = React.useState<CacheObserver[]>(
    []
  )
  return (
    <VoyagerContext.Provider
      value={{
        client: {
          url,
          auth,
          connector: connector as APIConnector.Config
        },
        cacheObservers,
        setCacheObservers
      }}
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
