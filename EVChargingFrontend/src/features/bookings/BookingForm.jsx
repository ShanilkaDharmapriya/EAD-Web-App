import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { bookingsAPI } from '../../api/bookings'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import Button from '../../components/UI/Button'
import Select from '../../components/UI/Select'
import Input from '../../components/UI/Input'

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

const BookingForm = ({ booking, onClose, isOpen }) => {
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: booking ? {
      stationId: booking.stationId,
      reservationDate: dayjs(booking.reservationDateTime).format('YYYY-MM-DD'),
      reservationTime: dayjs(booking.reservationDateTime).format('HH:mm'),
    } : {
      stationId: '',
      reservationDate: dayjs().format('YYYY-MM-DD'),
      reservationTime: dayjs().add(1, 'hour').format('HH:mm'),
    }
  })

  // Fetch stations for dropdown
  const { data: stationsData } = useQuery({
    queryKey: ['stations'],
    queryFn: () => stationsAPI.getStations(),
  })

  const createMutation = useMutation({
    mutationFn: bookingsAPI.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      showSuccess('Success', 'Booking created successfully')
      onClose()
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to create booking')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => bookingsAPI.updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      showSuccess('Success', 'Booking updated successfully')
      onClose()
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to update booking')
    },
  })

  const onSubmit = (data) => {
    const reservationDateTime = dayjs(`${data.reservationDate} ${data.reservationTime}`).toISOString()
    const bookingData = {
      stationId: data.stationId,
      reservationDateTime: reservationDateTime,
    }

    if (booking) {
      updateMutation.mutate({ id: booking.id, data: bookingData })
    } else {
      createMutation.mutate(bookingData)
    }
  }

  if (!isOpen) return null

  const stations = stationsData?.data?.items || []

  return (
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
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {booking ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

export default BookingForm
