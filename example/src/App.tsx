import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  VoyagerProvider,
  usePost,
  useLogin,
  useRegister,
  useUser,
  useLogout
} from 'voyager'
import Home from './Home'
import SingleRestaurant from './SingleRestaurant'

const Create = () => {
  const [createRestaurant, { loading }] = usePost('restaurants')

  if (loading) return <p>Creating</p>

  return (
    <button
      onClick={() => {
        createRestaurant({
          body: { name: 'La Fam' + Math.random() * 1000, image: 'http' }
        }).catch((err) => alert(err.message))
      }}
    >
      Create
    </button>
  )
}

const Main = () => {
  const { login, loading } = useLogin()
  const { register, loading: registerLoading } = useRegister()
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
  return (
    <Router>
      <Switch>
        <Route path='/restaurant/:id'>
          <SingleRestaurant />
        </Route>
        <Route path='/main'>
          <Main />
        </Route>
        <Route path='/'>
          <Home />
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
