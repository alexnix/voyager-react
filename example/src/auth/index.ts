import authHook from './authHook'
import useUser from './useUser'
import useToken from './useToken'
import useLogout from './useLogout'

const useLogin = authHook('login')
const useRegister = authHook('register')

export { useLogin, useRegister, useToken, useUser, useLogout }
