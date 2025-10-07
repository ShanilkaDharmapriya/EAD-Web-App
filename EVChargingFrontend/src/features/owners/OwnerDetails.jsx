import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ownersAPI } from '../../api/owners'
import { bookingsAPI } from '../../api/bookings'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Badge from '../../components/UI/Badge'
import Button from '../../components/UI/Button'
import { ArrowLeftIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

const OwnerDetails = () => {
  const { nic } = useParams()

  const { data: ownerData, isLoading: ownerLoading } = useQuery({
    queryKey: ['owner', nic],
    queryFn: () => ownersAPI.getOwner(nic),
    enabled: !!nic
  })

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', { ownerNic: nic }],
    queryFn: () => bookingsAPI.getOwnerBookings(nic, { page: 1, size: 10 }),
    enabled: !!nic
  })

  const { data: dashboardData } = useQuery({
    queryKey: ['ownerDashboard', nic],
    queryFn: () => bookingsAPI.getOwnerDashboard(nic),
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

  if (ownerLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    )
  }

  if (!ownerData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Owner not found</p>
        <Link to="/owners" className="text-primary-600 hover:text-primary-500">
          Back to Owners
        </Link>
      </div>
    )
  }

  const owner = ownerData.data
  const bookings = bookingsData?.data?.items || []
  const stats = dashboardData?.data || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/owners">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{owner.name}</h1>
          <p className="text-sm text-gray-500">NIC: {owner.nic}</p>
        </div>
      </div>

      {/* Owner Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Owner Information</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">NIC</label>
              <p className="text-sm text-gray-900">{owner.nic}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm text-gray-900">{owner.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-sm text-gray-900">{owner.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={owner.isActive ? 'success' : 'danger'}>
                  {owner.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <p className="text-sm text-gray-900">
                {new Date(owner.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-sm text-gray-900">
                {new Date(owner.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card>
          <Card.Header>
            <Card.Title>Booking Statistics</Card.Title>
          </Card.Header>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Pending</span>
              <span className="text-lg font-semibold text-warning-600">
                {stats.pendingCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Approved</span>
              <span className="text-lg font-semibold text-success-600">
                {stats.approvedCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Completed</span>
              <span className="text-lg font-semibold text-info-600">
                {stats.completedCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.totalCount || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Bookings</Card.Title>
        </Card.Header>
        {bookingsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
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
                  title="No bookings found"
                  description="This owner hasn't made any bookings yet."
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
        )}
      </Card>

      {/* View All Bookings Link */}
      {bookings.length > 0 && (
        <div className="text-center">
          <Link to={`/bookings?owner=${nic}`}>
            <Button variant="outline">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              View All Bookings
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default OwnerDetails
