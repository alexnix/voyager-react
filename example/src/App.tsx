import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  VoyagerProvider,
  // usePost,
  useLogin,
  useRegister,
  useUser,
  useLogout
} from 'voyager'
import PrivateRoute from './PrivateRoute'
import MainLayout from './layouts/main'
import Home from './Home'
import SingleRestaurant from './SingleRestaurant'
import Login from './Login'
import Account from './Account'

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
          register('john', 'doe')
            .then((r: any) => console.log('r:', r))
            .catch((e: any) => console.log('e:', e))
        }
      >
        Register
      </button>
      <button
        onClick={() =>
          login('user', '123456')
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
  return (
    <VoyagerProvider
      url='http://localhost:3001/api/v1'
      auth='http://localhost:3001/auth'
      useCache={false}
    >
      <MyRouter />
    </VoyagerProvider>
  )
}

export default App
