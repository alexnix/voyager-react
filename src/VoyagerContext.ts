import React, { Dispatch, SetStateAction } from 'react'
import type { CacheObserver } from './typings'

interface VoyagerContext_t {
  url: string
  auth?: string
  cacheObservers?: CacheObserver[]
  setCacheObservers?: Dispatch<SetStateAction<CacheObserver[]>>
}

const defaultContext: VoyagerContext_t = { url: '' }

const VoyagerContext = React.createContext(defaultContext)

export default VoyagerContext
