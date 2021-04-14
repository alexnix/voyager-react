import useAuthData from './useAuthData'
import { AuthData } from './types'

function useToken(): string | undefined {
  const [authData] = useAuthData<AuthData>()
  return authData?.token
}

export default useToken
