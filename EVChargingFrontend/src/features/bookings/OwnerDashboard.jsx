import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../app/store.jsx'
import { bookingsAPI } from '../../api/bookings'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Badge from '../../components/UI/Badge'
import { 
  CalendarDaysIcon, 
  CheckCircleIcon, 
  ClockIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline'

const OwnerDashboard = () => {
  const { user } = useAuth()
  const nic = user?.nic

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['ownerDashboard', nic],
    queryFn: () => bookingsAPI.getOwnerDashboard(nic),
    enabled: !!nic
  })

  const { data: recentBookings } = useQuery({
    queryKey: ['bookings', { ownerNic: nic, page: 1, size: 5 }],
    queryFn: () => bookingsAPI.getOwnerBookings(nic, { page: 1, size: 5 }),
    enabled: !!nic
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    )
  }

  const stats = dashboardData?.data || {}
  const bookings = recentBookings?.data?.items || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name}! Here's your booking overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-warning-100">
              <ClockIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingCount || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-success-100">
              <CheckCircleIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approvedCount || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-info-100">
              <CalendarDaysIcon className="h-6 w-6 text-info-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedCount || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-danger-100">
              <XCircleIcon className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cancelledCount || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Bookings</Card.Title>
        </Card.Header>
        <Table>
          <Table.Header>
            <tr>
              <Table.Head>Station</Table.Head>
              <Table.Head>Reservation Time</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Created</Table.Head>
            </tr>
          </Table.Header>
          <Table.Body>
            {bookings.length === 0 ? (
              <Table.EmptyState
                title="No bookings yet"
                description="You haven't made any bookings yet. Create your first booking to get started."
              />
            ) : (
              bookings.map((booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell className="font-medium">
                    {booking.stationName || 'N/A'}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(booking.reservationDateTime).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>
                    {getStatusBadge(booking.status)}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
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
              Browse Charging Stations
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Rules</h3>
          <div className="space-y-1 text-sm text-gray-500">
            <p>• Bookings must be made at least 12 hours in advance</p>
            <p>• Reservations can only be made up to 7 days in advance</p>
            <p>• You can modify bookings up to 12 hours before the reservation time</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default OwnerDashboard
