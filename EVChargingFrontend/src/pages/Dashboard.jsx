import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../app/store.jsx'
import { usersAPI } from '../api/users'
import { ownersAPI } from '../api/owners'
import { stationsAPI } from '../api/stations'
import { bookingsAPI } from '../api/bookings'
import Table from '../components/UI/Table'
import Badge from '../components/UI/Badge'
import { 
  UsersIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  CalendarDaysIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user } = useAuth()
  const isBackoffice = user?.role === 'Backoffice'

  // Fetch dashboard data
  const { data: usersData } = useQuery({
    queryKey: ['users', { page: 1, size: 1 }],
    queryFn: () => usersAPI.getUsers({ page: 1, size: 1 }),
    enabled: isBackoffice
  })

  const { data: ownersData } = useQuery({
    queryKey: ['owners', { page: 1, size: 1 }],
    queryFn: () => ownersAPI.getOwners({ page: 1, size: 1 }),
    enabled: isBackoffice
  })

  const { data: stationsData } = useQuery({
    queryKey: ['stations', user?.id],
    queryFn: () => stationsAPI.getStations({ 
      operatorId: user?.role === 'StationOperator' ? user.id : undefined 
    })
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', { page: 1, size: 5 }],
    queryFn: () => bookingsAPI.getBookings({ page: 1, size: 5 }),
    enabled: user?.role === 'StationOperator' || user?.role === 'Backoffice'
  })

  const stats = [
    {
      name: 'Total Users',
      value: usersData?.data?.totalCount || 0,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      enabled: isBackoffice,
      description: 'System administrators and staff'
    },
    {
      name: 'EV Owners',
      value: ownersData?.data?.totalCount || 0,
      icon: UserGroupIcon,
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-br from-violet-50 to-violet-100',
      enabled: isBackoffice,
      description: 'Registered electric vehicle owners'
    },
    {
      name: 'Charging Stations',
      value: stationsData?.data?.items?.filter(station => station.isActive)?.length || stationsData?.data?.filter(station => station.isActive)?.length || 0,
      icon: BuildingOfficeIcon,
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-br from-violet-50 to-violet-100',
      enabled: true,
      description: 'Active charging points'
    },
    {
      name: 'Recent Bookings',
      value: bookingsData?.data?.items?.length || bookingsData?.data?.length || 0,
      icon: CalendarDaysIcon,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      enabled: true,
      description: 'Current session bookings'
    }
  ]

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: 'warning',
      Approved: 'success',
      Completed: 'info',
      Cancelled: 'danger'
    }
    return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>
  }

  const quickActions = [
    {
      name: 'View Stations',
      href: '/stations',
      icon: EyeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      name: 'Manage Bookings',
      href: '/bookings',
      icon: CalendarDaysIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    },
    {
      name: 'Manage Users',
      href: '/users',
      icon: UsersIcon,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
      enabled: isBackoffice
    },
    {
      name: 'Manage EV Owners',
      href: '/owners',
      icon: UserGroupIcon,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
      enabled: isBackoffice
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Welcome back, {user?.username || 'User'}</h1>
          <p className="text-sm text-slate-500">Here's what's happening with your EV charging system today.</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          {stats.filter(stat => stat.enabled).map((stat, index) => {
            const colorSchemes = [
              { 
                icon: 'bg-blue-500', 
                text: 'text-blue-700', 
                bg: 'bg-white', 
                border: 'border-slate-200', 
                shadow: 'shadow-lg',
                accent: 'text-blue-600'
              },
              { 
                icon: 'bg-emerald-500', 
                text: 'text-emerald-700', 
                bg: 'bg-white', 
                border: 'border-slate-200', 
                shadow: 'shadow-lg',
                accent: 'text-emerald-600'
              },
              { 
                icon: 'bg-indigo-500', 
                text: 'text-indigo-700', 
                bg: 'bg-white', 
                border: 'border-slate-200', 
                shadow: 'shadow-lg',
                accent: 'text-indigo-600'
              },
              { 
                icon: 'bg-violet-500', 
                text: 'text-violet-700', 
                bg: 'bg-white', 
                border: 'border-slate-200', 
                shadow: 'shadow-lg',
                accent: 'text-violet-600'
              }
            ]
            const colors = colorSchemes[index % colorSchemes.length]
            
            return (
              <div 
                key={stat.name} 
                className={`relative ${colors.bg} border ${colors.border} rounded-2xl ${colors.shadow} hover:shadow-xl hover:scale-105 transition-all duration-300 group`}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-500 mb-2">{stat.name}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`${colors.icon} text-white p-4 rounded-2xl shadow-lg`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  {stat.description && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 leading-relaxed">{stat.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
              <p className="text-sm text-slate-500 mt-1">Manage your system efficiently</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.filter(action => action.enabled !== false).map((action, index) => {
              const actionColors = [
                { bg: 'bg-blue-500', text: 'text-blue-600', hover: 'hover:bg-blue-600', card: 'bg-blue-50', border: 'border-blue-200' },
                { bg: 'bg-emerald-500', text: 'text-emerald-600', hover: 'hover:bg-emerald-600', card: 'bg-emerald-50', border: 'border-emerald-200' },
                { bg: 'bg-indigo-500', text: 'text-indigo-600', hover: 'hover:bg-indigo-600', card: 'bg-indigo-50', border: 'border-indigo-200' },
                { bg: 'bg-violet-500', text: 'text-violet-600', hover: 'hover:bg-violet-600', card: 'bg-violet-50', border: 'border-violet-200' }
              ]
              const colors = actionColors[index % actionColors.length]
              
              return (
                <a
                  key={action.name}
                  href={action.href}
                  className={`group flex flex-col items-center gap-4 justify-center ${colors.card} border ${colors.border} rounded-2xl py-8 px-6 text-sm font-medium text-slate-700 hover:shadow-lg hover:scale-105 transition-all duration-300 min-h-[120px]`}
                >
                  <div className={`${colors.bg} ${colors.hover} text-white p-4 rounded-2xl shadow-lg transition-colors duration-300`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-center font-semibold text-slate-800">{action.name}</span>
                </a>
              )
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">System Status</h3>
              <p className="text-sm text-slate-500 mt-1">Monitor system health and connectivity</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-emerald-700">All systems operational</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all duration-300">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <div>
                <span className="text-sm font-semibold text-slate-900">API Connected</span>
                <p className="text-xs text-slate-500">Backend services running</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all duration-300">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <div>
                <span className="text-sm font-semibold text-slate-900">Database Online</span>
                <p className="text-xs text-slate-500">Data storage accessible</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Analytics - Only for Backoffice */}
        {isBackoffice && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">System Analytics</h3>
                <p className="text-sm text-slate-500 mt-1">Key performance indicators and insights</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Active Sessions</span>
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
                <p className="text-2xl font-bold text-blue-900">24</p>
                <p className="text-xs text-blue-600 mt-2">Currently charging vehicles</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-700">Revenue</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                </div>
                <p className="text-2xl font-bold text-emerald-900">$12,450</p>
                <p className="text-xs text-emerald-600 mt-2">Total earnings this month</p>
              </div>
              
              <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-violet-700">Efficiency</span>
                  <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                </div>
                <p className="text-2xl font-bold text-violet-900">94%</p>
                <p className="text-xs text-violet-600 mt-2">Station utilization rate</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-700">Avg. Session</span>
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                </div>
                <p className="text-2xl font-bold text-orange-900">2.4h</p>
                <p className="text-xs text-orange-600 mt-2">Average charging duration</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        {bookingsData?.data && (bookingsData.data.items?.length > 0 || bookingsData.data.length > 0) && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Bookings</h3>
                  <p className="text-sm text-slate-500 mt-1">Latest booking activities</p>
                </div>
                <a href="/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all duration-300">View all</a>
              </div>
            </div>
            <div className="overflow-hidden">
              <Table>
                <Table.Header>
                  <tr className="bg-slate-50">
                    <Table.Head className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-4">Station</Table.Head>
                    <Table.Head className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-4">Date & Time</Table.Head>
                    <Table.Head className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-4">Status</Table.Head>
                    <Table.Head className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-4">Created</Table.Head>
                  </tr>
                </Table.Header>
                <Table.Body>
                  {(bookingsData.data.items || bookingsData.data).map((booking) => (
                    <Table.Row key={booking.id} className="hover:bg-slate-50 transition-all duration-200 border-b border-slate-100">
                      <Table.Cell className="text-sm text-slate-900 font-medium py-4">{booking.stationName || 'N/A'}</Table.Cell>
                      <Table.Cell className="text-sm text-slate-600 py-4">
                        {new Date(booking.reservationDateTime).toLocaleString()}
                      </Table.Cell>
                      <Table.Cell className="py-4">{getStatusBadge(booking.status)}</Table.Cell>
                      <Table.Cell className="text-sm text-slate-600 py-4">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard
