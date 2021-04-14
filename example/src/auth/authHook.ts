import { useReducer } from 'react'
import useAuthData from './useAuthData'
import { to } from 'await-to-js'
import { RequestState, AuthFunction } from './types'
import produce from 'immer'

const initializer = {
  loading: false,
  called: false,
  data: null,
  err: null
}

type Action =
  | { type: 'START' }
  | { type: 'ERROR'; payload: string }
  | { type: 'SUCCESS'; payload: any }

const reducer = (state: RequestState, action: Action): RequestState =>
  produce(state, (draft) => {
    switch (action.type) {
      case 'START': {
        draft.loading = true
        return draft
      }
      case 'ERROR': {
        draft.loading = false
        draft.called = true
        draft.data = null
        draft.err = action.payload
        return draft
      }
      case 'SUCCESS': {
        draft.loading = false
        draft.called = true
        draft.data = action.payload
        draft.err = null
        return draft
      }
      default:
        throw Error('Unkown action.')
    }
  })

function authHook(hookType: 'login' | 'register') {
  return (): [RequestState, AuthFunction] => {
    const auth = 'http://localhost:3001/auth'

    const [requestState, dispatch] = useReducer(reducer, initializer)

    const [, setAuthData] = useAuthData()

    const run: AuthFunction = async ({ username, password, extra }) => {
      dispatch({ type: 'START' })
      const [err, res] = await to(
        fetch(`${auth}/${hookType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username,
            password,
            extra
          })
        })
      )
      if (err) {
        dispatch({ type: 'ERROR', payload: err.message })
        return null
      }

      const data = await res?.json()
      if (res?.status !== 200) {
        dispatch({ type: 'ERROR', payload: data.message })
        return null
      }

      dispatch({ type: 'SUCCESS', payload: data })
      setAuthData(data)
      return res
    }

    return [requestState, run]
  }
}

export default authHook
