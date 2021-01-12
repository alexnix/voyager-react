import createPersistedState from 'use-persisted-state'
import { useState } from 'react'

const useToken: typeof useState = createPersistedState('authData')

export default useToken
