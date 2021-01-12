import * as React from 'react'

import VoyagerContext from './VoyagerContext'
import VoyagerCache from './VoyagerCache'

import { useGet, usePost, usePut, useDetlete, useLazyGet } from './hooks/api'
import { useLogin, useRegister } from './hooks/auth'

import { VoyagerProviderProps } from './types'

const VoyagerProvider = ({
  url,
  auth,
  useCache,
  children
}: VoyagerProviderProps) => {
  const [cache, setCache] = React.useState({ value: {} })
  return (
    <VoyagerContext.Provider value={{ url, auth, useCache }}>
      <VoyagerCache.Provider value={{ ...cache, setCache }}>
        {children}
      </VoyagerCache.Provider>
    </VoyagerContext.Provider>
  )
}

export {
  VoyagerProvider,
  useGet,
  usePost,
  usePut,
  useDetlete,
  useLazyGet,
  useLogin,
  useRegister
}
