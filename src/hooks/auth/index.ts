import { LoginHook, RegisterHook } from './../../types'
import authHook from './authHook'
import useUser from './useUser'
import useLogout from './useLogout'

const useLogin = authHook<LoginHook>('login')
const useRegister = authHook<RegisterHook>('register')

export { useLogin, useRegister, useUser, useLogout }
