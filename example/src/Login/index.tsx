import React from 'react'
import LoginForm from './LoginForm'
import { useLogin, useUser } from 'voyager-react'
import { Redirect } from 'react-router-dom'

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [{ err }, login] = useLogin()
  const user = useUser()

  if (user) {
    return <Redirect to={{ pathname: '/' }} />
  }

  return (
    <LoginForm
      error={err}
      onLogin={({ username, password }) => {
        login({ username, password })
      }}
    />
  )
}

export default Login
