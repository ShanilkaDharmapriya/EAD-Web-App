import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-64">
        <Topbar onMobileMenuToggle={() => setSidebarOpen(true)} />
        <main className="min-h-screen">
          <div className="relative bg-slate-50">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppShell
