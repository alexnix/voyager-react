import authHook from './authHook'
import useUser from './useUser'
import useLogout from './useLogout'

const useLogin = authHook('login')
const useRegister = authHook('register')

export { useLogin, useRegister, useUser, useLogout }
