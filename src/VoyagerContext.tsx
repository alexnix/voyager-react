import React from 'react'
import type { VoyagerContext_t } from './typings'

const defaultContext: Partial<VoyagerContext_t> = {}

const VoyagerContext = React.createContext(defaultContext)

export default VoyagerContext
