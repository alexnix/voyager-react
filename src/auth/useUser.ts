import useAuthData from '../localStorage/useAuthData'
import {AuthData} from '../types'

function useUser<T = any>(): T | undefined {
  const [authData] = useAuthData<AuthData>()
  return authData?.user
}

export default useUser
