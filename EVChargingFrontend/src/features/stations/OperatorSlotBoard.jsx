import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { stationsAPI } from '../../api/stations'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Select from '../../components/UI/Select'
import Badge from '../../components/UI/Badge'
import { 
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const OperatorSlotBoard = ({ stationId, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewDays, setViewDays] = useState(7)
  const [selectedSlot, setSelectedSlot] = useState(null)

  const { data: availabilityData, isLoading, error } = useQuery({
    queryKey: ['stationAvailability', stationId, selectedDate, viewDays],
    queryFn: () => stationsAPI.getStationAvailability(stationId, selectedDate, viewDays),
    enabled: !!stationId
  })

  const { data: overridesData } = useQuery({
    queryKey: ['stationOverrides', stationId, selectedDate, viewDays],
    queryFn: () => stationsAPI.getStationOverrides(stationId, selectedDate, viewDays),
    enabled: !!stationId
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
        <p className="text-red-600">Failed to load availability data</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    )
  }

  const availability = availabilityData?.data
  if (!availability) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No availability data available</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    )
  }

  const getSlotColor = (hour) => {
    if (hour.status === 'closed') return 'bg-gray-200 text-gray-500'
    if (hour.status === 'maintenance') return 'bg-yellow-200 text-yellow-800'
    
    const totalBookings = hour.approvedCount + hour.pendingCount
    const isFull = totalBookings >= hour.capacity
    const isNearlyFull = hour.capacity > 0 && (totalBookings * 100 / hour.capacity) >= 80
    
    if (isFull) return 'bg-red-200 text-red-800'
    if (isNearlyFull) return 'bg-orange-200 text-orange-800'
    return 'bg-green-200 text-green-800'
  }

  const getSlotBadge = (hour) => {
    if (hour.status === 'closed') return <Badge variant="secondary">Closed</Badge>
    if (hour.status === 'maintenance') return <Badge variant="warning">Maintenance</Badge>
    
    const totalBookings = hour.approvedCount + hour.pendingCount
    const isFull = totalBookings >= hour.capacity
    const isNearlyFull = hour.capacity > 0 && (totalBookings * 100 / hour.capacity) >= 80
    
    if (isFull) return <Badge variant="danger">Full</Badge>
    if (isNearlyFull) return <Badge variant="warning">Nearly Full</Badge>
    return <Badge variant="success">Available</Badge>
  }

  const handleDateChange = (direction) => {
    const currentDate = new Date(selectedDate)
    const newDate = new Date(currentDate)
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - viewDays)
    } else {
      newDate.setDate(currentDate.getDate() + viewDays)
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0])
  }

  const handleSlotClick = (date, hour) => {
    setSelectedSlot({ date, hour })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Operator Slot Board</h2>
          <p className="text-sm text-gray-500">{availability.stationName}</p>
        </div>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>

      {/* Station Info */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Capacity</p>
                <p className="text-lg font-semibold">{availability.totalSlots} slots</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Working Hours</p>
                <p className="text-lg font-semibold">
                  {availability.openTime} - {availability.closeTime}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-lg font-semibold">
                  {availability.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Cog6ToothIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">View Days</p>
                <p className="text-lg font-semibold">{viewDays} days</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateChange('prev')}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateChange('next')}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <Select
                value={viewDays.toString()}
                onChange={(e) => setViewDays(parseInt(e.target.value))}
                options={[
                  { value: '7', label: '7 Days' },
                  { value: '14', label: '14 Days' },
                  { value: '30', label: '30 Days' }
                ]}
                className="w-32"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Manage Schedule
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Availability Grid</h3>
          
          {availability.dateAvailability.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No availability data for the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availability.dateAvailability.map((dateAvail) => (
                <div key={dateAvail.date} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">
                      {new Date(dateAvail.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    {dateAvail.isClosed && (
                      <Badge variant="danger">Day Closed</Badge>
                    )}
                    {(dateAvail.specialOpenTime || dateAvail.specialCloseTime) && (
                      <Badge variant="info">Special Hours</Badge>
                    )}
                  </div>

                  {dateAvail.isClosed ? (
                    <div className="text-center py-4 text-gray-500">
                      Station is closed for this day
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                      {dateAvail.hourAvailability.map((hour) => (
                        <button
                          key={hour.hour}
                          onClick={() => handleSlotClick(dateAvail.date, hour)}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors ${getSlotColor(hour)} hover:opacity-80`}
                          title={`${hour.hour}: ${hour.approvedCount} approved, ${hour.pendingCount} pending, ${hour.capacity} total slots`}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{hour.hour}</div>
                            <div className="text-xs mt-1">
                              {hour.approvedCount + hour.pendingCount}/{hour.capacity}
                            </div>
                            <div className="text-xs text-gray-500">
                              {hour.approvedCount}A, {hour.pendingCount}P
                            </div>
                            <div className="text-xs mt-1">
                              {getSlotBadge(hour)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Slot Details Drawer */}
      {selectedSlot && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Slot Details - {selectedSlot.date} at {selectedSlot.hour.hour}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSlot(null)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedSlot.hour.approvedCount}</p>
                  <p className="text-sm text-gray-500">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{selectedSlot.hour.pendingCount}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedSlot.hour.capacity - (selectedSlot.hour.approvedCount + selectedSlot.hour.pendingCount)}</p>
                  <p className="text-sm text-gray-500">Available</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedSlot.hour.capacity}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <p className="text-sm text-gray-600">
                  {selectedSlot.hour.status === 'maintenance' && selectedSlot.hour.reason
                    ? `Maintenance: ${selectedSlot.hour.reason}`
                    : `Status: ${selectedSlot.hour.status}`}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" disabled={selectedSlot.hour.isFull}>
                  Approve All Pending
                </Button>
                <Button variant="outline" size="sm">
                  View Bookings
                </Button>
                <Button variant="outline" size="sm">
                  Set Maintenance
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default OperatorSlotBoard
