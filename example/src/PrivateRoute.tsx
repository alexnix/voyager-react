import React from 'react'
import { Route, Redirect } from 'react-router-dom'

interface PrivateRouteProps {
  authenticated: boolean
  children: React.ReactNode
  [key: string]: any
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  authenticated,
  children,
  ...rest
}) => {
  if (!authenticated) {
    return <Redirect to={{ pathname: '/login' }} />
  }

  return <Route {...rest}>{children}</Route>
}

export default PrivateRoute
