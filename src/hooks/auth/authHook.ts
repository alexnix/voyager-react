import { useContext, useState } from 'react'
import VoyagerContext from '../../VoyagerContext'
import useAuthData from '../localStorage/useAuthData'
import { to } from 'await-to-js'
import { RequestState } from '../../types'

function authHook<T>(hookType: 'login' | 'register') {
  return (): [RequestState, () => void] => {
    const { auth } = useContext(VoyagerContext)

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [, setAuthData] = useAuthData()

    const run = async (
      username: string,
      password: string,
      extra?: { [key: string]: any }
    ): Promise<any> => {
      setLoading(true)
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
        setLoading(false)
        setError(err.message)
      } else {
        const data = await res?.json()
        if (res?.status === 200) {
          setLoading(false)
          setAuthData(data)
          return data
        } else {
          setLoading(false)
          setError(data.message)
        }
      }
    }

    return ({ loading, error, [hookType]: run } as unknown) as T
  }
}

export default authHook
