import * as React from 'react'
import type { CacheContext } from './typings'

const defaultContext: CacheContext = {
  cache: {}
}

const VoyagerCache = React.createContext(defaultContext)

export default VoyagerCache
