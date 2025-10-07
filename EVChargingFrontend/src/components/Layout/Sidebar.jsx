import { NavLink } from 'react-router-dom'
import { 
  HomeIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../app/store.jsx'

const Sidebar = () => {
  const { user } = useAuth()
  const isBackoffice = user?.role === 'Backoffice'
  const isStationOperator = user?.role === 'StationOperator'

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: false },
    ...(isBackoffice ? [
      { name: 'Users', href: '/users', icon: UsersIcon, current: false },
    ] : []),
  ]

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">EV Charging</h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-5 w-5"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
