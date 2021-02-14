import { useContext, useState } from 'react'
import VoyagerContext from '../VoyagerContext'
import useAuthData from '../localStorage/useAuthData'
import { to } from 'await-to-js'
import { RequestState, AuthFunction } from '../types'
import doNetwork from '../api/doNetowrk'

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
        doNetwork('POST', `${auth}/${hookType}`, undefined, {
          username,
          password,
          extra
        })
      )
      if (err) {
        setRequestState({
          loading: false,
          called: true,
          data: null,
          err: err.message,
          meta: null
        })
        return null
      } else {
        setRequestState({
          loading: false,
          called: true,
          data: res,
          err: null,
          meta: null
        })
        setAuthData(res)
        return res
      }
    }

    return [requestState, run]
  }
}

export default authHook
