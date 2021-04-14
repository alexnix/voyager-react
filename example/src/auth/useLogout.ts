import useAuthData from './useAuthData'

function useLogout() {
  const [, setAuthData] = useAuthData()
  return () => {
    setAuthData(null)
  }
}

export default useLogout
