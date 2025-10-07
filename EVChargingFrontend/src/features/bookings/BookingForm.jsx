import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { bookingsAPI } from '../../api/bookings'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import DateTimePicker from '../../components/UI/DateTimePicker'
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'

const bookingSchema = z.object({
  stationId: z.string().min(1, 'Station is required'),
  reservationDateTime: z.string().min(1, 'Date and time is required'),
  duration: z.number().min(1, 'Duration must be at least 1 hour').max(8, 'Duration cannot exceed 8 hours'),
  notes: z.string().optional()
})

const BookingForm = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [selectedStation, setSelectedStation] = useState(null)

  const { data: stations } = useQuery({
    queryKey: ['stations'],
    queryFn: () => stationsAPI.getStations()
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: 1
    }
  })

  const createBookingMutation = useMutation({
    mutationFn: (data) => bookingsAPI.createBooking(data),
    onSuccess: () => {
      showToast('Booking created successfully', 'success')
      navigate('/bookings')
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to create booking', 'error')
    }
  })

  const onSubmit = (data) => {
    createBookingMutation.mutate(data)
  }

  const handleStationChange = (stationId) => {
    const station = stations?.data?.find(s => s.id === stationId)
    setSelectedStation(station)
    setValue('stationId', stationId)
  }

  const handleDateTimeChange = (dateTime) => {
    setValue('reservationDateTime', dateTime)
  }

  const getAvailableTimeSlots = () => {
    if (!selectedStation) return []
    
    const slots = []
    const startHour = 6 // 6 AM
    const endHour = 22 // 10 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        value: hour,
        label: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
      })
    }
    
    return slots
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Booking</h1>
        <p className="mt-1 text-sm text-gray-500">
          Book a charging session at your preferred station
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Station Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Station
            </label>
            <Select
              options={stations?.data?.map(station => ({
                value: station.id,
                label: `${station.name} - ${station.location}`
              })) || []}
              onChange={handleStationChange}
              placeholder="Choose a station"
            />
            {errors.stationId && (
              <p className="mt-1 text-sm text-red-600">{errors.stationId.message}</p>
            )}
          </div>

          {/* Station Details */}
          {selectedStation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Station Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{selectedStation.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {selectedStation.operatingHours || '24/7'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reservation Date & Time
            </label>
            <DateTimePicker
              onChange={handleDateTimeChange}
              minDate={new Date()}
              placeholder="Select date and time"
            />
            {errors.reservationDateTime && (
              <p className="mt-1 text-sm text-red-600">{errors.reservationDateTime.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours)
            </label>
            <Select
              options={[
                { value: 1, label: '1 hour' },
                { value: 2, label: '2 hours' },
                { value: 3, label: '3 hours' },
                { value: 4, label: '4 hours' },
                { value: 6, label: '6 hours' },
                { value: 8, label: '8 hours' }
              ]}
              onChange={(value) => setValue('duration', parseInt(value))}
              placeholder="Select duration"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Any special requirements or notes..."
            />
          </div>

          {/* Pricing Information */}
          {selectedStation && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Estimated Cost</h3>
              <div className="text-sm text-blue-700">
                <p>Rate: ${selectedStation.hourlyRate || 2.50} per hour</p>
                <p>Duration: {watch('duration') || 1} hour(s)</p>
                <p className="font-medium">
                  Total: ${((selectedStation.hourlyRate || 2.50) * (watch('duration') || 1)).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/bookings')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default BookingForm
