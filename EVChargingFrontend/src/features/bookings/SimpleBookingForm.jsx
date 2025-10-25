import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { bookingsAPI } from '../../api/bookings'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import { isWithin7Days, respects12HourRule } from '../../utils/dateRules'
import { getErrorMessage } from '../../utils/errors'
import Button from '../../components/UI/Button'
import Select from '../../components/UI/Select'
import Input from '../../components/UI/Input'
import LoadingButton from '../../components/ui/LoadingButton'
import Card from '../../components/UI/Card'

const bookingSchema = z.object({
  stationId: z.string().min(1, 'Please select a station'),
  reservationDate: z.string().min(1, 'Please select a date'),
  timeSlot: z.string().min(1, 'Please select a time slot'),
})

const SimpleBookingForm = ({ onClose, isOpen }) => {
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      stationId: '',
      reservationDate: dayjs().format('YYYY-MM-DD'),
      timeSlot: '',
    }
  })

  const watchedValues = watch()

  // Fetch stations for dropdown
  const { data: stationsData } = useQuery({
    queryKey: ['stations'],
    queryFn: () => stationsAPI.getStations(),
  })

  // Generate time slots (1-hour slots from 6 AM to 10 PM)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 22; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`
      slots.push({
        value: timeString,
        label: timeString,
        hour: hour
      })
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Check availability for selected station and date
  const checkAvailability = async (stationId, date) => {
    if (!stationId || !date) return

    console.log('Checking availability for station:', stationId, 'date:', date)
    setLoadingSlots(true)
    try {
      // Get real availability from backend
      const availabilityData = await bookingsAPI.getAvailableSlots(stationId, date)
      console.log('Availability data:', availabilityData)
      
      if (availabilityData.success) {
        const timeSlots = availabilityData.data.timeSlots
        console.log('Time slots from backend:', timeSlots)
        const availableSlots = timeSlots.map(slot => ({
          value: slot.time,
          label: slot.time,
          hour: parseInt(slot.time.split(':')[0]),
          available: slot.available,
          approvedBookings: slot.approvedBookings,
          pendingBookings: slot.pendingBookings,
          totalSlots: slot.totalSlots
        }))
        
        console.log('Processed available slots:', availableSlots)
        setAvailableSlots(availableSlots)
      } else {
        console.error('Failed to get availability:', availabilityData.message)
        showError('Error', availabilityData.message || 'Failed to check availability')
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      console.log('Falling back to default time slots')
      
      // Fallback to default time slots if API fails
      const defaultSlots = generateTimeSlots().map(slot => ({
        ...slot,
        available: true,
        approvedBookings: 0,
        pendingBookings: 0,
        totalSlots: 5 // Default assumption
      }))
      
      setAvailableSlots(defaultSlots)
      showError('Warning', 'Using default time slots - availability may not be accurate')
    } finally {
      setLoadingSlots(false)
    }
  }

  // Watch for changes in station and date
  useEffect(() => {
    if (watchedValues.stationId && watchedValues.reservationDate) {
      checkAvailability(watchedValues.stationId, watchedValues.reservationDate)
    }
  }, [watchedValues.stationId, watchedValues.reservationDate])

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
      let errorMessage = getErrorMessage(error)
      
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

  const onSubmit = (data) => {
    // Create proper date objects with explicit timezone handling
    const startDate = dayjs.utc(`${data.reservationDate}T${data.timeSlot}`)
    const endDate = startDate.add(1, 'hour') // 1-hour booking
    
    const bookingData = {
      stationId: data.stationId,
      reservationDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
    }

    console.log('Form data:', data)
    console.log('Booking data being sent:', bookingData)
    console.log('Start date:', startDate.toISOString())
    console.log('End date:', endDate.toISOString())

    createMutation.mutate(bookingData)
  }

  if (!isOpen) return null

  const stations = stationsData?.data?.items || []
  const activeStations = stations.filter(station => station.isActive)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Booking</h2>
          
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot (1 Hour)
              </label>
              {/* Hidden input for form validation */}
              <input
                type="hidden"
                {...register('timeSlot')}
              />
              {loadingSlots ? (
                <p className="text-sm text-gray-500">Loading available slots...</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-gray-500">No time slots available for the selected date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => {
                        if (slot.available) {
                          setValue('timeSlot', slot.value)
                        }
                      }}
                      className={`p-2 text-sm border rounded-md transition-colors ${
                        watchedValues.timeSlot === slot.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : slot.available
                          ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!slot.available}
                      title={slot.available 
                        ? `Available (${slot.totalSlots - (slot.approvedBookings + slot.pendingBookings)} slots left)`
                        : `Fully booked (${slot.approvedBookings + slot.pendingBookings}/${slot.totalSlots} slots used)`
                      }
                    >
                      <div className="text-center">
                        <div className="font-medium">{slot.label}</div>
                        {watchedValues.timeSlot === slot.value && (
                          <div className="text-xs text-blue-600 font-semibold">✓ Selected</div>
                        )}
                        {slot.available && watchedValues.timeSlot !== slot.value && (
                          <div className="text-xs text-green-600">
                            {slot.totalSlots - (slot.approvedBookings + slot.pendingBookings)} left
                          </div>
                        )}
                        {!slot.available && (
                          <div className="text-xs text-red-600">Full</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errors.timeSlot && (
                <p className="text-red-500 text-sm mt-1">{errors.timeSlot.message}</p>
              )}
            </div>

            <div className="text-sm text-gray-500">
              <p>• Bookings must be made at least 12 hours in advance</p>
              <p>• Reservations can only be made up to 7 days in advance</p>
              <p>• Each booking is for 1 hour</p>
            </div>

            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 border-t pt-2">
                <p>Debug: Selected time slot: {watchedValues.timeSlot || 'None'}</p>
                <p>Available slots: {availableSlots.length}</p>
                <p>Station: {watchedValues.stationId || 'None'}</p>
                <p>Date: {watchedValues.reservationDate || 'None'}</p>
              </div>
            )}

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
                loading={createMutation.isPending}
                disabled={loadingSlots}
              >
                Create Booking
              </LoadingButton>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default SimpleBookingForm
