import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/errors'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import { 
  ClockIcon,
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const StationScheduleEditor = ({ stationId, onClose }) => {
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const [schedule, setSchedule] = useState({
    openTime: '08:00',
    closeTime: '20:00'
  })

  const { data: stationData, isLoading } = useQuery({
    queryKey: ['station', stationId],
    queryFn: () => stationsAPI.getStation(stationId),
    enabled: !!stationId,
    onSuccess: (data) => {
      if (data?.data) {
        setSchedule({
          openTime: data.data.openTime || '08:00',
          closeTime: data.data.closeTime || '20:00'
        })
      }
    }
  })

  const updateScheduleMutation = useMutation({
    mutationFn: (scheduleData) => stationsAPI.updateStationSchedule(stationId, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['station', stationId] })
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      showSuccess('Success', 'Station schedule updated successfully')
      onClose()
    },
    onError: (error) => {
      showError('Error', getErrorMessage(error))
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate times
    if (schedule.openTime >= schedule.closeTime) {
      showError('Error', 'Opening time must be before closing time')
      return
    }

    // Validate working hours (minimum 1 hour, maximum 24 hours)
    const openTime = new Date(`2000-01-01T${schedule.openTime}:00`)
    const closeTime = new Date(`2000-01-01T${schedule.closeTime}:00`)
    const diffHours = (closeTime - openTime) / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      showError('Error', 'Station must be open for at least 1 hour')
      return
    }

    if (diffHours > 24) {
      showError('Error', 'Station cannot be open for more than 24 hours')
      return
    }

    updateScheduleMutation.mutate({
      openTime: schedule.openTime,
      closeTime: schedule.closeTime
    })
  }

  const handleTimeChange = (field, value) => {
    setSchedule(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Edit Station Schedule</h2>
          <p className="text-sm text-gray-500">{stationData?.data?.name}</p>
        </div>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>

      {/* Current Schedule Info */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Opening Time</p>
                <p className="text-lg font-semibold">{schedule.openTime}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Closing Time</p>
                <p className="text-lg font-semibold">{schedule.closeTime}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule Editor Form */}
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Working Hours</h3>
            <p className="text-sm text-gray-500 mb-6">
              Set the daily operating hours for this charging station. Bookings can only be made within these hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Time
              </label>
              <Input
                type="time"
                value={schedule.openTime}
                onChange={(e) => handleTimeChange('openTime', e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Station opens at this time daily
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Time
              </label>
              <Input
                type="time"
                value={schedule.closeTime}
                onChange={(e) => handleTimeChange('closeTime', e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Station closes at this time daily
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Schedule Preview</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Daily: {schedule.openTime} - {schedule.closeTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Duration: {(() => {
                    const openTime = new Date(`2000-01-01T${schedule.openTime}:00`)
                    const closeTime = new Date(`2000-01-01T${schedule.closeTime}:00`)
                    const diffHours = (closeTime - openTime) / (1000 * 60 * 60)
                    return `${diffHours} hours`
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Important Notes</h4>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Changes will affect all future bookings</li>
                    <li>Existing approved bookings will not be affected</li>
                    <li>New bookings can only be made within working hours</li>
                    <li>Station must be open for at least 1 hour daily</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateScheduleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateScheduleMutation.isPending}
              className="flex items-center space-x-2"
            >
              {updateScheduleMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Update Schedule</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default StationScheduleEditor