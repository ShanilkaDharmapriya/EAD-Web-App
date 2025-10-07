import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../app/store.jsx'
import { bookingsAPI } from '../../api/bookings'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Badge from '../../components/UI/Badge'
import { 
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const OwnerDashboard = () => {
  const { user } = useAuth()

  const { data: recentBookings } = useQuery({
    queryKey: ['owner-bookings', user?.nic],
    queryFn: () => bookingsAPI.getOwnerBookings(user?.nic || '', { page: 1, size: 5 }),
    enabled: !!user?.nic
  })

  const { data: statsData } = useQuery({
    queryKey: ['owner-stats', user?.nic],
    queryFn: () => bookingsAPI.getOwnerStats(user?.nic || ''),
    enabled: !!user?.nic
  })

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: 'warning',
      Approved: 'success',
      Completed: 'info',
      Cancelled: 'danger'
    }
    return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>
  }

  const stats = [
    {
      name: 'Total Bookings',
      value: statsData?.totalBookings || 0,
      icon: CalendarDaysIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Completed',
      value: statsData?.completedBookings || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Pending',
      value: statsData?.pendingBookings || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Cancelled',
      value: statsData?.cancelledBookings || 0,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.username || user?.name}! Here's an overview of your charging bookings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
      <Card>
        <Card.Header>
          <Card.Title>Recent Bookings</Card.Title>
        </Card.Header>
        {recentBookings?.data && recentBookings.data.length > 0 ? (
          <Table>
            <Table.Header>
              <tr>
                <Table.Head>Station</Table.Head>
                <Table.Head>Date & Time</Table.Head>
                <Table.Head>Duration</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Created</Table.Head>
              </tr>
            </Table.Header>
            <Table.Body>
              {recentBookings.data.map((booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell>
                    <div>
                      <p className="font-medium text-gray-900">{booking.stationName}</p>
                      <p className="text-sm text-gray-500">{booking.stationLocation}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <p className="text-sm text-gray-900">
                        {new Date(booking.reservationDateTime).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.reservationDateTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{booking.duration} hours</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{getStatusBadge(booking.status)}</Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by creating your first charging booking
            </p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/bookings/new"
              className="block text-sm text-primary-600 hover:text-primary-500"
            >
              Create New Booking
            </a>
            <a
              href="/bookings"
              className="block text-sm text-primary-600 hover:text-primary-500"
            >
              View All Bookings
            </a>
            <a
              href="/stations"
              className="block text-sm text-primary-600 hover:text-primary-500"
            >
              Browse Stations
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Tips</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Book in advance for popular stations</p>
            <p>• Check station availability before booking</p>
            <p>• Arrive on time to avoid cancellation</p>
            <p>• Contact support for any issues</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Support</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Need help with your bookings?</p>
            <a
              href="mailto:support@evcharging.com"
              className="block text-primary-600 hover:text-primary-500"
            >
              Contact Support
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default OwnerDashboard
