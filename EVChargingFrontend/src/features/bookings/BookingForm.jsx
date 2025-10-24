import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { bookingsAPI } from '../../api/bookings'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import { isWithin7Days, respects12HourRule, parseDateTime } from '../../utils/dateRules'
import { useAvailability } from '../../hooks/useAvailability'
import { getErrorMessage } from '../../utils/errors'
import Button from '../../components/UI/Button'
import Select from '../../components/UI/Select'
import Input from '../../components/UI/Input'
import LoadingButton from '../../components/ui/LoadingButton'

const bookingSchema = z.object({
  stationId: z.string().min(1, 'Please select a station'),
  reservationDate: z.string().min(1, 'Please select a date'),
  reservationTime: z.string().min(1, 'Please select a time'),
}).superRefine((data, ctx) => {
  const dt = parseDateTime(data.reservationDate, data.reservationTime)
  if (!isWithin7Days(dt)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reservation must be within the next 7 days.", path: ["reservationDate"] })
  }
  if (!respects12HourRule(dt)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reservations/changes must be at least 12 hours in advance.", path: ["reservationTime"] })
  }
})

const BookingForm = ({ booking, onClose, isOpen }) => {
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const { state: avail, loading: availLoading, error: availError, check } = useAvailability()

  const {
    register,
    handleSubmit,
    reset,
    watch,
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

  const watchedValues = watch()

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
      showError('Error', getErrorMessage(error))
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
      showError('Error', getErrorMessage(error))
    },
  })

  // Check availability when station/date/time changes
  const onDateTimeChange = async (stationId, date, time) => {
    if (stationId && date && time) {
      const start = dayjs(`${date} ${time}`)
      const end = start.add(1, 'hour') // assume 1-hour slot
      await check(stationId, start.toISOString(), end.toISOString())
    }
  }

  // Watch for changes and trigger availability check
  React.useEffect(() => {
    if (watchedValues.stationId && watchedValues.reservationDate && watchedValues.reservationTime) {
      onDateTimeChange(watchedValues.stationId, watchedValues.reservationDate, watchedValues.reservationTime)
    }
  }, [watchedValues.stationId, watchedValues.reservationDate, watchedValues.reservationTime])

  const onSubmit = (data) => {
    // Block submission if slot is unavailable
    if (avail === "unavailable") {
      showError('Error', 'Selected time is not available.')
      return
    }

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
  
  // Filter out inactive stations for EV owners
  const activeStations = stations.filter(station => station.isActive)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Charging Station"
        {...register('stationId')}
        error={errors.stationId?.message}
        options={activeStations.map(station => ({
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

      {/* Availability feedback */}
      {availLoading && <p className="text-sm text-gray-500">Checking slot availability…</p>}
      {avail === "unavailable" && <p className="text-sm text-red-600">Selected time is already booked.</p>}
      {availError && <p className="text-sm text-amber-600">{availError}</p>}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={avail === "unavailable"}
        >
          {booking ? 'Update' : 'Create'}
        </LoadingButton>
      </div>
    </form>
  )
}

export default BookingForm
