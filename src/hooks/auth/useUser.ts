import useAuthData from '../localStorage/useAuthData'
import { AuthData } from '../../types'

function useUser() {
  const [authData] = useAuthData<AuthData>()
  return authData?.user
}

export default useUser
