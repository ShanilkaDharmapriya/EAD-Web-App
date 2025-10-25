import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { stationsAPI } from '../../api/stations'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { 
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const StationScheduleViewer = ({ station, onClose }) => {
  const { data: stationData, isLoading, error } = useQuery({
    queryKey: ['station', station?.id],
    queryFn: () => stationsAPI.getStation(station.id),
    enabled: !!station?.id
  })

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load station data</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    )
  }

  const stationInfo = stationData?.data
  if (!stationInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No station data available</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Station Schedule</h2>
          <p className="text-sm text-gray-500">{stationInfo.name}</p>
        </div>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>

      {/* Current Schedule Info */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Working Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ClockIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Opening Time</p>
                <p className="text-2xl font-bold text-gray-900">{stationInfo.openTime || '08:00'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <ClockIcon className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Closing Time</p>
                <p className="text-2xl font-bold text-gray-900">{stationInfo.closeTime || '20:00'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule Details */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Details</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                <strong>Daily Schedule:</strong> {stationInfo.openTime || '08:00'} - {stationInfo.closeTime || '20:00'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                <strong>Duration:</strong> {(() => {
                  const openTime = stationInfo.openTime || '08:00'
                  const closeTime = stationInfo.closeTime || '20:00'
                  const open = new Date(`2000-01-01T${openTime}:00`)
                  const close = new Date(`2000-01-01T${closeTime}:00`)
                  const diffHours = (close - open) / (1000 * 60 * 60)
                  return `${diffHours} hours`
                })()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Booking Rules */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Rules</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Important Information</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bookings can only be made within working hours</li>
                    <li>Reservations must be made at least 12 hours in advance</li>
                    <li>Bookings can only be made up to 7 days in advance</li>
                    <li>All times are displayed in the station's local timezone</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default StationScheduleViewer