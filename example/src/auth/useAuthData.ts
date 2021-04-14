import createPersistedState from 'use-persisted-state'
import { useState } from 'react'

const useAuthData: typeof useState = createPersistedState('authData')

export default useAuthData
