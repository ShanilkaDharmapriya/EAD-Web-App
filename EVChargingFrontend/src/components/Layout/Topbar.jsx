import { useState } from 'react'
import { useAuth } from '../../app/store.jsx'
import { 
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const Topbar = ({ onMobileMenuToggle }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="fixed top-0 z-40 w-full h-16 bg-white border-b-2 border-slate-200 shadow-lg px-6 flex items-center">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-500 lg:hidden hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 ease-out"
          onClick={onMobileMenuToggle}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Left: App Icon + Title */}
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">EV</span>
          </div>
          <div className="ml-3">
            <h1 className="text-sm font-semibold text-slate-900">Charging Admin</h1>
            <p className="text-xs text-slate-500">Management System</p>
          </div>
        </div>

        {/* Center: Search (optional) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 h-8 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 focus:bg-white"
            />
          </div>
        </div>

        {/* Spacer to push right content to the right */}
        <div className="flex-1"></div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 ease-out"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-9 hover:bg-slate-100 transition-all duration-200 ease-out"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-xs">
                  {(user?.username || user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden lg:flex lg:flex-col lg:items-start">
                <span className="text-sm font-medium text-slate-700">
                  {user?.username || user?.name}
                </span>
                <span className="text-xs text-slate-500">{user?.role}</span>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-xl bg-white py-2 shadow-xl border border-slate-200 focus:outline-none">
                <div className="px-4 py-2 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-900">{user?.username || user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout()
                    setUserMenuOpen(false)
                  }}
                  className="block w-full px-4 py-2 text-left text-sm leading-6 text-slate-700 hover:bg-slate-50 transition-all duration-200 ease-out"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar
