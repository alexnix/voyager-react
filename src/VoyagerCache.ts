import * as React from 'react'
import { CacheContext } from './types'

const defaultContext: CacheContext = {
  cache: {}
}

const VoyagerCache = React.createContext(defaultContext)

export default VoyagerCache
