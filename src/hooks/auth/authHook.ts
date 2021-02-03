import { useContext, useState } from 'react'
import VoyagerContext from '../../VoyagerContext'
import useAuthData from '../localStorage/useAuthData'
import { to } from 'await-to-js'
import { RequestState, AuthFunction } from '../../types'

function authHook(hookType: 'login' | 'register') {
  return (): [RequestState, AuthFunction] => {
    const { auth } = useContext(VoyagerContext)

    const [requestState, setRequestState] = useState<RequestState>({
      loading: false,
      called: false,
      data: null,
      err: null,
      meta: null
    })

    const [, setAuthData] = useAuthData()

    const run: AuthFunction = async ({ username, password, extra }) => {
      setRequestState((prev) => ({ ...prev, loading: true }))
      const [err, res] = await to(
        fetch(`${auth}/${hookType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password, extra })
        })
      )
      if (err) {
        setRequestState((prev) => ({
          ...prev,
          loading: false,
          err: err.message,
          called: true
        }))
      } else {
        const data = await res?.json()
        if (res?.status === 200) {
          setRequestState((prev) => ({
            ...prev,
            loading: false,
            err: null,
            called: true
          }))
          setAuthData(data)
        } else {
          setRequestState((prev) => ({
            ...prev,
            loading: false,
            err: data.message,
            called: true
          }))
        }
      }
    }

    return [requestState, run]
  }
}

export default authHook
