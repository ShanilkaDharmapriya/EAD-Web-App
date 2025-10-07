import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../app/store.jsx'
import { 
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['Backoffice', 'StationOperator', 'EVOwner'] },
  { name: 'Users', href: '/users', icon: UsersIcon, roles: ['Backoffice'] },
  { name: 'EV Owners', href: '/owners', icon: UserGroupIcon, roles: ['Backoffice'] },
  { name: 'Charging Stations', href: '/stations', icon: BuildingOfficeIcon, roles: ['Backoffice', 'StationOperator'] },
  { name: 'Bookings', href: '/bookings', icon: CalendarDaysIcon, roles: ['Backoffice', 'StationOperator', 'EVOwner'] },
  { name: 'Owner Dashboard', href: '/owner-dashboard', icon: ChartBarIcon, roles: ['EVOwner'] },
]

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth()
  const location = useLocation()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-80 flex-col bg-white border-r-2 border-slate-200 shadow-lg">
          <div className="relative flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">EV</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-sm font-semibold text-slate-900">Charging Admin</h1>
                <p className="text-xs text-slate-500">Management System</p>
              </div>
            </div>
            <button
              type="button"
              className="text-slate-600 hover:text-slate-800 hover:bg-white/70 rounded-xl p-2 transition-all duration-200 ease-out"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="relative flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item, index) => {
              const isActive = location.pathname === item.href
              const accentColors = [
                { bg: 'bg-blue-500', text: 'text-blue-600' },
                { bg: 'bg-emerald-500', text: 'text-emerald-600' },
                { bg: 'bg-indigo-500', text: 'text-indigo-600' },
                { bg: 'bg-violet-500', text: 'text-violet-600' }
              ]
              const colors = accentColors[index % accentColors.length]
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? `${colors.bg} text-white shadow-sm` 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className={`${
                    isActive ? `${colors.text} font-semibold` : 'text-slate-700'
                  }`}>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="relative flex grow flex-col gap-y-6 overflow-y-auto bg-white border-r-2 border-slate-200 shadow-lg">
          <div className="relative flex h-16 shrink-0 items-center px-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">EV</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-sm font-semibold text-slate-900">Charging Admin</h1>
                <p className="text-xs text-slate-500">Management System</p>
              </div>
            </div>
          </div>
          <nav className="relative flex flex-1 flex-col px-4">
            <ul role="list" className="flex flex-1 flex-col gap-y-6">
              <li>
                <ul role="list" className="space-y-2">
                  {filteredNavigation.map((item, index) => {
                    const isActive = location.pathname === item.href
                    const accentColors = [
                      { bg: 'bg-blue-500', text: 'text-blue-600' },
                      { bg: 'bg-emerald-500', text: 'text-emerald-600' },
                      { bg: 'bg-indigo-500', text: 'text-indigo-600' },
                      { bg: 'bg-violet-500', text: 'text-violet-600' }
                    ]
                    const colors = accentColors[index % accentColors.length]
                    
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                            isActive
                              ? 'bg-blue-50 border border-blue-200 shadow-sm'
                              : 'text-slate-700 hover:bg-slate-50 hover:shadow-sm'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? `${colors.bg} text-white shadow-sm` 
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          }`}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <span className={`${
                            isActive ? `${colors.text} font-semibold` : 'text-slate-700'
                          }`}>{item.name}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar
