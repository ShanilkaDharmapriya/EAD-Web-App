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
  startTime: z.string().min(1, 'Please select a start time'),
  endTime: z.string().min(1, 'Please select an end time'),
}).superRefine((data, ctx) => {
  const startDt = dayjs(`${data.reservationDate}T${data.startTime}`).utc()
  const endDt = dayjs(`${data.reservationDate}T${data.endTime}`).utc()
  
  if (!isWithin7Days(startDt)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reservation must be within the next 7 days.", path: ["reservationDate"] })
  }
  if (!respects12HourRule(startDt)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reservations/changes must be at least 12 hours in advance.", path: ["startTime"] })
  }
  if (endDt <= startDt) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time must be after start time.", path: ["endTime"] })
  }
  if (endDt.diff(startDt, 'hours') > 8) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Booking duration cannot exceed 8 hours.", path: ["endTime"] })
  }
})

const BookingForm = ({ booking, onClose, isOpen }) => {
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const { state: avail, loading: availLoading, error: availError, check } = useAvailability()

  // Debug authentication
  const debugAuth = async () => {
    try {
      const result = await bookingsAPI.debugAuth()
      console.log('Auth debug result:', result)
      showSuccess('Debug', 'Authentication info logged to console')
    } catch (error) {
      console.error('Auth debug error:', error)
      showError('Debug Error', 'Failed to get authentication info')
    }
  }

  // Test booking creation
  const testBooking = async () => {
    try {
      const result = await bookingsAPI.testBooking()
      console.log('Test booking result:', result)
      showSuccess('Test Booking', 'Test booking completed - check console for details')
    } catch (error) {
      console.error('Test booking error:', error)
      showError('Test Booking Error', error.response?.data?.message || 'Test booking failed')
    }
  }

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
      startTime: dayjs(booking.reservationDateTime).format('HH:mm'),
      endTime: booking.endDateTime ? dayjs(booking.endDateTime).format('HH:mm') : dayjs(booking.reservationDateTime).add(1, 'hour').format('HH:mm'),
    } : {
      stationId: '',
      reservationDate: dayjs().format('YYYY-MM-DD'),
      startTime: dayjs().add(1, 'hour').format('HH:mm'),
      endTime: dayjs().add(2, 'hours').format('HH:mm'),
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
      console.error('Booking creation error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      
      let errorMessage = getErrorMessage(error)
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.'
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid booking data. Please check your input.'
      } else if (error.response?.status === 409) {
        errorMessage = 'No slots available for the selected time.'
      }
      
      showError('Booking Creation Failed', errorMessage)
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
      console.error('Booking update error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      showError('Error', getErrorMessage(error))
    },
  })

  // Check availability when station/date/time changes
  const onDateTimeChange = async (stationId, date, startTime, endTime) => {
    if (stationId && date && startTime && endTime) {
      const start = dayjs.utc(`${date}T${startTime}`)
      const end = dayjs.utc(`${date}T${endTime}`)
      await check(stationId, start.toISOString(), end.toISOString())
    }
  }

  // Watch for changes and trigger availability check
  React.useEffect(() => {
    if (watchedValues.stationId && watchedValues.reservationDate && watchedValues.startTime && watchedValues.endTime) {
      onDateTimeChange(watchedValues.stationId, watchedValues.reservationDate, watchedValues.startTime, watchedValues.endTime)
    }
  }, [watchedValues.stationId, watchedValues.reservationDate, watchedValues.startTime, watchedValues.endTime])

  const onSubmit = (data) => {
    // Block submission if slot is unavailable
    if (avail === "unavailable") {
      showError('Error', 'Selected time is not available.')
      return
    }

    // Create proper date objects with explicit timezone handling
    const startDate = dayjs.utc(`${data.reservationDate}T${data.startTime}`)
    const endDate = dayjs.utc(`${data.reservationDate}T${data.endTime}`)
    
    const bookingData = {
      stationId: data.stationId,
      reservationDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
    }

    console.log('Form data:', data)
    console.log('Booking data being sent:', bookingData)
    console.log('Start date:', startDate.toISOString())
    console.log('End date:', endDate.toISOString())
    console.log('Current user token:', localStorage.getItem('token'))
    console.log('Current user data:', localStorage.getItem('user'))

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

      <Input
        label="Reservation Date"
        type="date"
        {...register('reservationDate')}
        error={errors.reservationDate?.message}
        min={dayjs().format('YYYY-MM-DD')}
        max={dayjs().add(7, 'days').format('YYYY-MM-DD')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Time"
          type="time"
          {...register('startTime')}
          error={errors.startTime?.message}
        />
        
        <Input
          label="End Time"
          type="time"
          {...register('endTime')}
          error={errors.endTime?.message}
        />
      </div>

      <div className="text-sm text-gray-500">
        <p>• Bookings must be made at least 12 hours in advance</p>
        <p>• Reservations can only be made up to 7 days in advance</p>
        <p>• Booking duration cannot exceed 8 hours</p>
        <p>• Times will be normalized to hour boundaries (e.g., 10:30 → 10:00)</p>
      </div>

      {/* Availability feedback */}
      {availLoading && <p className="text-sm text-gray-500">Checking slot availability…</p>}
      {avail === "unavailable" && <p className="text-sm text-red-600">Selected time is already booked.</p>}
      {availError && <p className="text-sm text-amber-600">{availError}</p>}

      <div className="flex justify-between pt-4">
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={debugAuth}
            className="text-xs"
          >
            Debug Auth
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={testBooking}
            className="text-xs"
          >
            Test Booking
          </Button>
        </div>
        
        <div className="flex space-x-3">
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
      </div>
    </form>
  )
}

export default BookingForm
