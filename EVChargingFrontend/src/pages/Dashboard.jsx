import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../app/store.jsx'
import { usersAPI } from '../api/users'
import { ownersAPI } from '../api/owners'
import { stationsAPI } from '../api/stations'
import { bookingsAPI } from '../api/bookings'
import Card from '../components/UI/Card'
import Table from '../components/UI/Table'
import Badge from '../components/UI/Badge'
import { 
  UsersIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  CalendarDaysIcon 
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user } = useAuth()
  const isBackoffice = user?.role === 'Backoffice'
  const isStationOperator = user?.role === 'StationOperator'

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
    queryKey: ['stations'],
    queryFn: () => stationsAPI.getStations()
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', { page: 1, size: 5 }],
    queryFn: () => bookingsAPI.getOwnerBookings(user?.nic || '', { page: 1, size: 5 }),
    enabled: !!user?.nic
  })

  const stats = [
    {
      name: 'Total Users',
      value: usersData?.data?.totalCount || 0,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      enabled: isBackoffice
    },
    {
      name: 'EV Owners',
      value: ownersData?.data?.totalCount || 0,
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      enabled: isBackoffice
    },
    {
      name: 'Charging Stations',
      value: stationsData?.data?.length || 0,
      icon: BuildingOfficeIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      enabled: true
    },
    {
      name: 'Recent Bookings',
      value: bookingsData?.data?.length || 0,
      icon: CalendarDaysIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      enabled: true
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.username || user?.name}! Here's what's happening with your EV charging system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.filter(stat => stat.enabled).map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      {bookingsData?.data && bookingsData.data.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Recent Bookings</Card.Title>
          </Card.Header>
          <Table>
            <Table.Header>
              <tr>
                <Table.Head>Station</Table.Head>
                <Table.Head>Date & Time</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Created</Table.Head>
              </tr>
            </Table.Header>
            <Table.Body>
              {bookingsData.data.map((booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell>{booking.stationName || 'N/A'}</Table.Cell>
                  <Table.Cell>
                    {new Date(booking.reservationDateTime).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>{getStatusBadge(booking.status)}</Table.Cell>
                  <Table.Cell>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/stations"
              className="block text-sm text-primary-600 hover:text-primary-500"
            >
              View Charging Stations
            </a>
            <a
              href="/bookings"
              className="block text-sm text-primary-600 hover:text-primary-500"
            >
              Manage Bookings
            </a>
            {isBackoffice && (
              <>
                <a
                  href="/users"
                  className="block text-sm text-primary-600 hover:text-primary-500"
                >
                  Manage Users
                </a>
                <a
                  href="/owners"
                  className="block text-sm text-primary-600 hover:text-primary-500"
                >
                  Manage EV Owners
                </a>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">API Connected</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Database Online</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
