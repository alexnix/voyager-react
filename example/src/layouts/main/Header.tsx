import React from 'react'

import { useUser, useLogout } from 'voyager-react'
import { Link } from 'react-router-dom'
import { useOpen, useClose } from '../../modal'

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const user = useUser()
  const logout = useLogout()

  const openInModal = useOpen()
  const closeModal = useClose()

  const modal2 = (
    <div>
      <button onClick={() => closeModal('foo')}>Close Modal 2</button>
    </div>
  )

  const modal1 = (
    <div>
      <button onClick={() => closeModal()}>Close</button>
      <button onClick={() => openInModal(modal2, { openInNew: 'foo' })}>
        Open Modal 2
      </button>
    </div>
  )

  return (
    <div>
      <button
        onClick={() => {
          openInModal(modal1, {
            style: 'red'
          })
        }}
      >
        click me
      </button>
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
