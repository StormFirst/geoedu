import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isMapPage = location.pathname === '/map-tools' || location.pathname === '/gamification'

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {isMapPage ? (
            <div className="w-full h-[calc(100vh-56px)] overflow-hidden relative">
              <Outlet />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
