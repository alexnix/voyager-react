import * as React from 'react'

import VoyagerContext from './VoyagerContext'
import VoyagerCache from './VoyagerCache'

import { useGet, usePost, usePut, useDetlete } from './api'
import usePagination from './api/usePagination'
import { useLogin, useRegister, useUser, useLogout } from './auth'

import { VoyagerProviderProps } from './types'

const VoyagerProvider = ({ url, auth, children }: VoyagerProviderProps) => {
  const [cache, setCache] = React.useState({ value: {} })
  return (
    <VoyagerContext.Provider value={{ url, auth }}>
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
  useLogin,
  useRegister,
  useUser,
  useLogout,
  usePagination
}
