import React from 'react'
import Header from './Header'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      <div>{children}</div>
      <div>Footer</div>
    </div>
  )
}

export default MainLayout
