import React, { useLayoutEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  VoyagerProvider
  // usePost,
  // useLogin,
  // useRegister,
  // useUser,
  // useLogout
} from 'voyager-react'
import { useLogin, useRegister, useUser, useLogout } from './auth'
import PrivateRoute from './PrivateRoute'
import MainLayout from './layouts/main'
import Home from './Home'
import SingleRestaurant from './SingleRestaurant'
import Login from './Login'
import Account from './Account'
import ModalProvider from './modal'
import fetchIntercept from 'fetch-intercept'
import { useToken } from './auth'

const Create = () => {
  // const [createRestaurant, { loading }] = usePost('restaurants')

  // if (loading) return <p>Creating</p>

  return <p>hi</p>
}

const Main = () => {
  const [{ loading }, login] = useLogin()
  const [{ loading: registerLoading }, register] = useRegister()
  const user = useUser()
  const logout = useLogout()

  console.log('user: ', user)

  if (loading || registerLoading) return <p>Loading</p>

  return (
    <div>
      {user ? (
        <p>
          Connected as {user?.username} <button onClick={logout}>Logout</button>
        </p>
      ) : (
        <p>Not Connected</p>
      )}
      <Create />
      <br />
      <button
        onClick={() =>
          register({ username: 'john', password: 'doe' })
            .then((r: any) => console.log('r:', r))
            .catch((e: any) => console.log('e:', e))
        }
      >
        Register
      </button>
      <button
        onClick={() =>
          login({ username: 'john', password: 'doe' })
            .then((r: any) => console.log('r:', r))
            .catch((e: any) => console.log('e:', e))
        }
      >
        Login
      </button>
    </div>
  )
}

const MyRouter: React.FC<{}> = () => {
  const user = useUser()

  console.log('user: ', user)

  return (
    <Router>
      <Switch>
        <Route path='/restaurant/:id'>
          <SingleRestaurant />
        </Route>
        <Route path='/main'>
          <Main />
        </Route>
        <Route path='/login'>
          <Login />
        </Route>
        <PrivateRoute path='/account' authenticated={user}>
          <MainLayout>
            <Account />
          </MainLayout>
        </PrivateRoute>
        <Route path='/'>
          <MainLayout>
            <Home />
          </MainLayout>
        </Route>
      </Switch>
    </Router>
  )
}

const App = () => {
  const token = useToken()
  useLayoutEffect(
    () =>
      fetchIntercept.register({
        request: (url, config) => {
          if (token) config.headers['Authorization'] = `Bearer ${token!}`
          return [url, config]
        }
      }),
    []
  )

  return (
    <VoyagerProvider
      url='http://localhost:3001/api/v1'
      auth='http://localhost:3001/auth'
    >
      <ModalProvider
        styles={{
          my: {
            content: {
              width: '300px',
              height: 'max-content',
              position: 'unset',
              border: 'none',
              borderRadius: '0px'
            },
            overlay: {
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }
        }}
      >
        <MyRouter />
      </ModalProvider>
    </VoyagerProvider>
  )
}

export default App
