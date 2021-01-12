import * as React from 'react'
import { Cache } from './types'

const defaultCache: Cache = { value: {} }

const VoyagerCache = React.createContext(defaultCache)

export default VoyagerCache
