import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs from 'dayjs'
import { bookingsAPI } from '../../api/bookings'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../app/store.jsx'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Modal from '../../components/UI/Modal'
import Badge from '../../components/UI/Badge'
import Pagination from '../../components/UI/Pagination'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline'

const bookingSchema = z.object({
  stationId: z.string().min(1, 'Please select a station'),
  reservationDate: z.string().min(1, 'Please select a date'),
  reservationTime: z.string().min(1, 'Please select a time'),
}).refine((data) => {
  const reservationDateTime = dayjs(`${data.reservationDate} ${data.reservationTime}`)
  const now = dayjs()
  const maxDate = now.add(7, 'days')
  return reservationDateTime.isAfter(now) && reservationDateTime.isBefore(maxDate)
}, {
  message: "Reservation must be in the future and within 7 days from now",
  path: ["reservationDate"]
})

const BookingsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    stationId: '',
    ownerNic: '',
  })
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const isBackoffice = user?.role === 'Backoffice'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
  })

  // Fetch stations for dropdown
  const { data: stationsData } = useQuery({
    queryKey: ['stations'],
    queryFn: () => stationsAPI.getStations(),
  })

  // Fetch bookings
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', { 
      page: currentPage, 
      size: 10, 
      ...filters,
      ownerNic: user?.nic || filters.ownerNic 
    }],
    queryFn: () => {
      // Use different API based on user role
      if (user?.role === 'Backoffice' || user?.role === 'StationOperator') {
        return bookingsAPI.getBookings({ 
          page: currentPage, 
          pageSize: 10, 
          evOwnerNIC: filters.ownerNic,
          stationId: filters.stationId,
          status: filters.status
        })
      } else {
        return bookingsAPI.getOwnerBookings(user?.nic || '', { 
          page: currentPage, 
          size: 10, 
          ...filters 
        })
      }
    },
  })

  // Create booking mutation
  const createMutation = useMutation({
    mutationFn: bookingsAPI.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      showSuccess('Success', 'Booking created successfully')
      setIsModalOpen(false)
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to create booking')
    },
  })

  // Update booking mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => bookingsAPI.updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      showSuccess('Success', 'Booking updated successfully')
      setIsModalOpen(false)
      setEditingBooking(null)
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to update booking')
    },
  })

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: bookingsAPI.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      showSuccess('Success', 'Booking cancelled successfully')
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to cancel booking')
    },
  })

  // Approve booking mutation
  const approveMutation = useMutation({
    mutationFn: bookingsAPI.approveBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      showSuccess('Success', 'Booking approved successfully')
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to approve booking')
    },
  })

  const handleCreate = () => {
    setEditingBooking(null)
    reset()
    setIsModalOpen(true)
  }

  const handleEdit = (booking) => {
    setEditingBooking(booking)
    reset({
      stationId: booking.stationId,
      reservationDate: dayjs(booking.reservationDateTime).format('YYYY-MM-DD'),
      reservationTime: dayjs(booking.reservationDateTime).format('HH:mm'),
    })
    setIsModalOpen(true)
  }

  const handleCancel = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate(bookingId)
    }
  }

  const handleApprove = (bookingId) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      approveMutation.mutate(bookingId)
    }
  }

  const onSubmit = (data) => {
    const reservationDateTime = dayjs(`${data.reservationDate} ${data.reservationTime}`).toISOString()
    const bookingData = {
      stationId: data.stationId,
      reservationDateTime: reservationDateTime,
    }

    if (editingBooking) {
      updateMutation.mutate({ id: editingBooking.id, data: bookingData })
    } else {
      createMutation.mutate(bookingData)
    }
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

  const canModify = (booking) => {
    const reservationTime = dayjs(booking.reservationDateTime)
    const now = dayjs()
    const hoursUntilReservation = reservationTime.diff(now, 'hours')
    return hoursUntilReservation >= 12
  }

  const stations = stationsData?.data?.items || []
  const bookings = bookingsData?.data?.items || []
  const totalPages = bookingsData?.data?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage charging station bookings</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
            />

            <Select
              label="Station"
              value={filters.stationId}
              onChange={(e) => setFilters({ ...filters, stationId: e.target.value })}
              options={[
                { value: '', label: 'All Stations' },
                ...stations.map(station => ({
                  value: station.id,
                  label: station.name
                }))
              ]}
            />

            {isBackoffice && (
              <Input
                label="Owner NIC"
                value={filters.ownerNic}
                onChange={(e) => setFilters({ ...filters, ownerNic: e.target.value })}
                placeholder="Search by owner NIC"
              />
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-6">
              <Table.EmptyState
                title="No bookings found"
                description="Get started by creating a new booking."
                action={
                  <Button onClick={handleCreate}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Booking
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <Table.Header>
                <tr>
                  <Table.Head>Station</Table.Head>
                  <Table.Head>Reservation Time</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Owner</Table.Head>
                  <Table.Head>Created</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </tr>
              </Table.Header>
              <Table.Body>
                {bookings.map((booking) => (
                    <Table.Row key={booking.id}>
                      <Table.Cell className="font-medium">
                        {booking.stationName || 'N/A'}
                      </Table.Cell>
                      <Table.Cell>
                        {dayjs(booking.reservationDateTime).format('MMM DD, YYYY HH:mm')}
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(booking.status)}
                      </Table.Cell>
                      <Table.Cell>{booking.evOwnerNIC}</Table.Cell>
                      <Table.Cell>
                        {dayjs(booking.createdAt).format('MMM DD, YYYY')}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          {canModify(booking) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(booking)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {booking.status === 'Pending' && (isBackoffice || user?.role === 'StationOperator') && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(booking.id)}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {canModify(booking) && booking.status !== 'Completed' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancel(booking.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBooking ? 'Edit Booking' : 'Create Booking'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Charging Station"
            {...register('stationId')}
            error={errors.stationId?.message}
            options={stations.map(station => ({
              value: station.id,
              label: `${station.name} (${station.type}) - ${station.availableSlots}/${station.totalSlots} slots`
            }))}
            placeholder="Select a station"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Reservation Date"
              type="date"
              {...register('reservationDate')}
              error={errors.reservationDate?.message}
              min={dayjs().format('YYYY-MM-DD')}
              max={dayjs().add(7, 'days').format('YYYY-MM-DD')}
            />
            
            <Input
              label="Reservation Time"
              type="time"
              {...register('reservationTime')}
              error={errors.reservationTime?.message}
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>• Bookings must be made at least 12 hours in advance</p>
            <p>• Reservations can only be made up to 7 days in advance</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingBooking ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default BookingsList
