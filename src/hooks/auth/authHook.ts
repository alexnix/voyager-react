import { useContext, useState } from 'react'
import VoyagerContext from '../../VoyagerContext'
import useAuthData from '../localStorage/useAuthData'
import { AuthData } from './../../types'

function authHook<T>(hookType: 'login' | 'register') {
  return (): T => {
    const { auth } = useContext(VoyagerContext)

    const [loading, setLoading] = useState<boolean>(false)

    const [, setAuthData] = useAuthData()

    const run = (
      username: string,
      password: string,
      extra?: { [key: string]: any }
    ): Promise<AuthData> => {
      setLoading(true)
      return new Promise<AuthData>((resolve, reject) => {
        fetch(`${auth}/${hookType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password, extra })
        })
          .then((r) => {
            if (r.status === 200) {
              return r.json()
            } else {
              throw Error(r.statusText)
            }
          })
          .then((data) => {
            setLoading(false)
            setAuthData(data)
            resolve({ ...data })
          })
          .catch((e) => {
            setLoading(false)
            reject(e)
          })
      })
    }

    return ({ loading, [hookType]: run } as unknown) as T
  }
}

export default authHook
