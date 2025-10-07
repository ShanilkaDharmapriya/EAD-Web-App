import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/store.jsx'
import { bookingsAPI } from '../../api/bookings'
import { useToast } from '../../hooks/useToast'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import Select from '../../components/UI/Select'
import Pagination from '../../components/UI/Pagination'
import { 
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const BookingsList = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const pageSize = 10

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', { 
      page: currentPage, 
      size: pageSize, 
      status: statusFilter,
      search: searchTerm 
    }],
    queryFn: () => bookingsAPI.getBookings({ 
      page: currentPage, 
      size: pageSize, 
      status: statusFilter,
      search: searchTerm 
    })
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

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString()
  }

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all charging station bookings
          </p>
        </div>
        <Link to="/bookings/new">
          <Button className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>New Booking</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by status"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setCurrentPage(1)
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <tr>
                  <Table.Head>Station</Table.Head>
                  <Table.Head>Date & Time</Table.Head>
                  <Table.Head>Duration</Table.Head>
                  <Table.Head>Owner</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Created</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </tr>
              </Table.Header>
              <Table.Body>
                {bookings?.data?.map((booking) => (
                  <Table.Row key={booking.id}>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{booking.stationName}</p>
                          <p className="text-sm text-gray-500">{booking.stationLocation}</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {new Date(booking.reservationDateTime).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.reservationDateTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{booking.duration} hours</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{booking.ownerName}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {getStatusBadge(booking.status)}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {bookings?.data?.length === 0 && (
              <div className="text-center py-12">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your search criteria' 
                    : 'Get started by creating a new booking'
                  }
                </p>
                {!searchTerm && !statusFilter && (
                  <div className="mt-6">
                    <Link to="/bookings/new">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Booking
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {bookings?.pagination && bookings.pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={bookings.pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default BookingsList
