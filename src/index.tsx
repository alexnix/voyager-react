import * as React from 'react'

import VoyagerContext from './VoyagerContext'
import VoyagerCache from './VoyagerCache'

import { useGet, usePost, usePut, useDetlete } from './api'
import usePagination from './api/usePagination'
import { useLogin, useRegister, useUser, useLogout } from './auth'

import { VoyagerProviderProps, CacheObserver, CacheValue } from './types'

const VoyagerProvider = ({ url, auth, children }: VoyagerProviderProps) => {
  const [cache, setCache] = React.useState<CacheValue>({})
  const [cacheObservers, setCacheObservers] = React.useState<CacheObserver[]>(
    []
  )
  return (
    <VoyagerContext.Provider
      value={{ url, auth, cacheObservers, setCacheObservers }}
    >
      <VoyagerCache.Provider value={{ cache, setCache }}>
        {children}
      </VoyagerCache.Provider>
    </VoyagerContext.Provider>
  )
}

const useCache: () => [CacheValue, (newCache: CacheValue) => void] = () => {
  const { cache, setCache } = React.useContext(VoyagerCache)

  const userSetCache = (newCache: CacheValue) => {
    setCache!(newCache)
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
  useLogin,
  useRegister,
  useUser,
  useLogout,
  usePagination,
  useCache,
  useCacheObserver
}
