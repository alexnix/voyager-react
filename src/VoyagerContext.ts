import React from 'react'

interface VoyagerContext_t {
  url: string
  auth?: string
}

const defaultContext: VoyagerContext_t = { url: '' }

const VoyagerContext = React.createContext(defaultContext)

export default VoyagerContext
