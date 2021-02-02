import React from 'react'

import { useUser, useLogout } from 'voyager'
import { Link } from 'react-router-dom'

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const user = useUser()
  const logout = useLogout()

  return (
    <div>
      <div>
        <Link to='/'>Dope Food</Link>
      </div>
      {user ? (
        <>
          Connected as{' '}
          <Link to='/account'>
            <b>{user?.username}</b>
          </Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to='/login'>Login</Link>
      )}
    </div>
  )
}

export default Header
