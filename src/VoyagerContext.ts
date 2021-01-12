import React from 'react'

interface VoyagerContext_t {
  url: string
  auth?: string
  useCache: boolean
}

const defaultContext: VoyagerContext_t = { url: '', useCache: false }

const VoyagerContext = React.createContext(defaultContext)

export default VoyagerContext
