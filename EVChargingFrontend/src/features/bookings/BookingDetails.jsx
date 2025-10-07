import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsAPI } from '../../api/bookings'
import { useToast } from '../../hooks/useToast'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import Modal from '../../components/UI/Modal'
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const BookingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [showCancelModal, setShowCancelModal] = useState(false)

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsAPI.getBooking(id),
    enabled: !!id
  })

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }) => bookingsAPI.updateBooking(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', id])
      queryClient.invalidateQueries(['bookings'])
      showToast('Booking updated successfully', 'success')
      setShowCancelModal(false)
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to update booking', 'error')
    }
  })

  const handleStatusUpdate = (status) => {
    updateBookingMutation.mutate({ id, status })
  }

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Booking not found</p>
        <Button onClick={() => navigate('/bookings')} className="mt-4">
          Back to Bookings
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/bookings')}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(booking.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Information */}
          <Card>
            <Card.Header>
              <Card.Title>Booking Information</Card.Title>
            </Card.Header>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reservation Date</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.reservationDateTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Time</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.reservationDateTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Station</p>
                    <p className="text-sm text-gray-500">{booking.stationName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Owner</p>
                    <p className="text-sm text-gray-500">{booking.ownerName}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Station Details */}
          <Card>
            <Card.Header>
              <Card.Title>Station Details</Card.Title>
            </Card.Header>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Station Name</h4>
                <p className="text-sm text-gray-500">{booking.stationName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Location</h4>
                <p className="text-sm text-gray-500">{booking.stationLocation}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <Card.Header>
              <Card.Title>Actions</Card.Title>
            </Card.Header>
            <div className="space-y-3">
              {booking.status === 'Pending' && (
                <>
                  <Button
                    onClick={() => handleStatusUpdate('Approved')}
                    className="w-full flex items-center justify-center space-x-2"
                    disabled={updateBookingMutation.isPending}
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Approve</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                </>
              )}
              {booking.status === 'Approved' && (
                <Button
                  onClick={() => handleStatusUpdate('Completed')}
                  className="w-full flex items-center justify-center space-x-2"
                  disabled={updateBookingMutation.isPending}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Mark Complete</span>
                </Button>
              )}
            </div>
          </Card>

          {/* Booking Timeline */}
          <Card>
            <Card.Header>
              <Card.Title>Timeline</Card.Title>
            </Card.Header>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Booking Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              onClick={() => handleStatusUpdate('Cancelled')}
              disabled={updateBookingMutation.isPending}
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default BookingDetails
