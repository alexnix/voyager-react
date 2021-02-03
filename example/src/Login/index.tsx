import React from 'react'
import LoginForm from './LoginForm'
import { useLogin, useUser } from 'voyager'
import { useHistory } from 'react-router-dom'

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [{ err }, login] = useLogin()
  const user = useUser()
  const history = useHistory()

  if (user) {
    history.push('/')
  }

  return (
    <LoginForm
      error={err}
      onLogin={({ username, password }) => {
        login(username, password)
      }}
    />
  )
}

export default Login
