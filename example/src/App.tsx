import React from 'react'

import {
  VoyagerProvider,
  useGet,
  usePost,
  useLogin,
  useRegister,
  useDetlete,
  useUser,
  useLogout
} from 'voyager'

interface Restaurant {
  name: string
  _id: string
  avg_rating?: number
  num_reviews?: number
}

// interface RestaurantsGetResult {
//   data: Restaurant[]
//   meta: {
//     hasNext: boolean
//     total: number
//   }
// }

interface RestaurantListProps {
  data: Restaurant[]
}

const RestaurantsListLoading = () => {
  return <p> 'Loading'</p>
}

const RestaurantListItem = ({ r }: { r: Restaurant }) => {
  const [del, { loading: loadingDel }] = useDetlete('restaurants')
  return (
    <li>
      {r.name}{' '}
      {loadingDel ? (
        'Deleting'
      ) : (
        <button
          onClick={() => del({ id: r._id }).catch((e) => alert(e.message))}
        >
          Delete
        </button>
      )}
    </li>
  )
}

const RestaurantList = ({ data }: RestaurantListProps) => {
  return (
    <ul>
      {data.map((r) => (
        <RestaurantListItem key={r._id} r={r} />
      ))}
    </ul>
  )
}

const RestaurantsListWrapper = () => {
  const [{ data, meta, called, loading, err }] = useGet<Restaurant[]>(
    'restaurants'
  )

  const a = 1

  React.useEffect(() => {
    console.log('hi')
  }, [a])

  console.log(data, err)

  if (!called) return null

  if (loading) return <RestaurantsListLoading />
  if (err) return <p>{JSON.stringify(err)}</p>

  return (
    <div>
      <div>
        Lista
        <RestaurantList data={data!} />
        {data!.length}/{meta!.total}
      </div>
    </div>
  )
}

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
      <RestaurantsListWrapper />
    </div>
  )
}

const App = () => {
  return (
    <VoyagerProvider
      url='http://localhost:3001/api/v1'
      auth='http://localhost:3001/auth'
      useCache={false}
    >
      <Main />
    </VoyagerProvider>
  )
}

export default App
