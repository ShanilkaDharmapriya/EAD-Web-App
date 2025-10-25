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
import { isWithin7Days, respects12HourRule, parseDateTime, isWithinWorkingHours } from '../../utils/dateRules'
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
  // Use same timezone handling as form submission
  const localStartDt = dayjs(`${data.reservationDate}T${data.startTime}`)
  const localEndDt = dayjs(`${data.reservationDate}T${data.endTime}`)
  const startDt = localStartDt.utc()
  const endDt = localEndDt.utc()
  
  // Validate 7-day window
  if (!isWithin7Days(startDt)) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: "Reservation must be within the next 7 days.", 
      path: ["reservationDate"] 
    })
  }
  
  // Validate 12-hour rule
  if (!respects12HourRule(startDt)) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: "Reservations must be at least 12 hours in advance.", 
      path: ["startTime"] 
    })
  }
  
  // Validate working hours
  if (!isWithinWorkingHours(startDt)) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: "Start time must be between 6:00 AM and 10:00 PM.", 
      path: ["startTime"] 
    })
  }
  
  if (!isWithinWorkingHours(endDt)) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: "End time must be between 6:00 AM and 10:00 PM.", 
      path: ["endTime"] 
    })
  }
  
  // Validate time order
  if (endDt <= startDt) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: "End time must be after start time.", 
      path: ["endTime"] 
    })
  }
  
  // Validate duration
  if (endDt.diff(startDt, 'hours') > 8) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: "Booking duration cannot exceed 8 hours.", 
      path: ["endTime"] 
    })
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
      reservationDate: dayjs.utc(booking.reservationDateTime).format('YYYY-MM-DD'),
      startTime: dayjs.utc(booking.reservationDateTime).format('HH:mm'),
      endTime: booking.endDateTime ? dayjs.utc(booking.endDateTime).format('HH:mm') : dayjs.utc(booking.reservationDateTime).add(1, 'hour').format('HH:mm'),
    } : {
      stationId: '',
      reservationDate: dayjs().utc().add(1, 'day').format('YYYY-MM-DD'), // Default to tomorrow
      startTime: '10:00', // Default to 10 AM
      endTime: '11:00', // Default to 11 AM (1 hour duration)
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
      // Use same timezone handling as form submission
      const localStart = dayjs(`${date}T${startTime}`)
      const localEnd = dayjs(`${date}T${endTime}`)
      const start = localStart.utc()
      const end = localEnd.utc()
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

    // Create date objects treating the input as local time, then convert to UTC
    // This ensures the time represents the actual local time the user selected
    const localStartDate = dayjs(`${data.reservationDate}T${data.startTime}`)
    const localEndDate = dayjs(`${data.reservationDate}T${data.endTime}`)
    
    // Convert to UTC for backend
    const startDate = localStartDate.utc()
    const endDate = localEndDate.utc()
    
    // Ensure dates are properly formatted for backend
    const bookingData = {
      stationId: data.stationId,
      reservationDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
    }

    console.log('Form data:', data)
    console.log('Booking data being sent:', bookingData)
    console.log('Local start time:', localStartDate.format('YYYY-MM-DD HH:mm:ss'))
    console.log('Local end time:', localEndDate.format('YYYY-MM-DD HH:mm:ss'))
    console.log('UTC start time:', startDate.toISOString())
    console.log('UTC end time:', endDate.toISOString())
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
        min={dayjs().utc().add(1, 'day').format('YYYY-MM-DD')} // Minimum tomorrow (12-hour rule)
        max={dayjs().utc().add(7, 'days').format('YYYY-MM-DD')} // Maximum 7 days ahead
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
        <p>• Operating hours: 6:00 AM to 10:00 PM</p>
        <p>• Times will be normalized to hour boundaries (e.g., 10:30 → 10:00)</p>
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
