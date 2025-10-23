import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { bookingsAPI } from '../../api/bookings'
import Card from '../../components/UI/Card'
import Badge from '../../components/UI/Badge'
import Button from '../../components/UI/Button'
import { ArrowLeftIcon, CalendarDaysIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline'

const BookingDetails = () => {
  const { id } = useParams()

  const { data: bookingData, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsAPI.getBooking(id),
    enabled: !!id
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

  if (!bookingData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Booking not found</p>
        <Link to="/bookings" className="text-primary-600 hover:text-primary-500">
          Back to Bookings
        </Link>
      </div>
    )
  }

  const booking = bookingData.data

  return (
    <div className="max-w-7xl mx-auto px-8 pt-6 pb-8">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
        <Link to="/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-sm text-gray-500">ID: {booking.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Booking Information</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                {getStatusBadge(booking.status)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Reservation Time</label>
              <p className="text-sm text-gray-900">
                {new Date(booking.reservationDateTime).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Station</label>
              <p className="text-sm text-gray-900">
                {booking.stationName || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Owner NIC</label>
              <p className="text-sm text-gray-900">{booking.evOwnerNIC}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Booking Date</label>
              <p className="text-sm text-gray-900">
                {new Date(booking.bookingDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm text-gray-900">
                {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-sm text-gray-900">
                {new Date(booking.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* QR Code */}
        {booking.qrPayload && (
          <Card>
            <Card.Header>
              <Card.Title>QR Code</Card.Title>
            </Card.Header>
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">QR Code for verification</p>
                <p className="text-xs text-gray-400 mt-2 break-all">{booking.qrPayload}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Station Information */}
      {booking.stationName && (
        <Card>
          <Card.Header>
            <Card.Title>Station Information</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Station Name</label>
              <p className="text-sm text-gray-900">{booking.stationName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Station Type</label>
              <p className="text-sm text-gray-900">{booking.stationType || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-sm text-gray-900">{booking.stationAddress || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Available Slots</label>
              <p className="text-sm text-gray-900">
                {booking.availableSlots || 'N/A'} / {booking.totalSlots || 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center">
        <Link to="/bookings">
          <Button variant="outline">
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            View All Bookings
          </Button>
        </Link>
      </div>
      </div>
    </div>
  )
}

export default BookingDetails
