import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Select from '../../components/UI/Select'
import { 
  ArrowLeftIcon,
  ClockIcon,
  CalendarDaysIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const StationScheduleEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isActive: true
  })

  const { data: station, isLoading } = useQuery({
    queryKey: ['station', id],
    queryFn: () => stationsAPI.getStation(id),
    enabled: !!id
  })

  const { data: schedules } = useQuery({
    queryKey: ['station-schedules', id],
    queryFn: () => stationsAPI.getStationSchedules(id),
    enabled: !!id
  })

  const createScheduleMutation = useMutation({
    mutationFn: (data) => stationsAPI.createStationSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['station-schedules', id])
      showToast('Schedule created successfully', 'success')
      setNewSchedule({ dayOfWeek: '', startTime: '', endTime: '', isActive: true })
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to create schedule', 'error')
    }
  })

  const deleteScheduleMutation = useMutation({
    mutationFn: (scheduleId) => stationsAPI.deleteStationSchedule(id, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['station-schedules', id])
      showToast('Schedule deleted successfully', 'success')
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to delete schedule', 'error')
    }
  })

  const handleAddSchedule = () => {
    if (!newSchedule.dayOfWeek || !newSchedule.startTime || !newSchedule.endTime) {
      showToast('Please fill in all schedule fields', 'error')
      return
    }
    createScheduleMutation.mutate(newSchedule)
  }

  const handleDeleteSchedule = (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      deleteScheduleMutation.mutate(scheduleId)
    }
  }

  const dayOptions = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ]

  const timeOptions = [
    { value: '00:00', label: '12:00 AM' },
    { value: '01:00', label: '1:00 AM' },
    { value: '02:00', label: '2:00 AM' },
    { value: '03:00', label: '3:00 AM' },
    { value: '04:00', label: '4:00 AM' },
    { value: '05:00', label: '5:00 AM' },
    { value: '06:00', label: '6:00 AM' },
    { value: '07:00', label: '7:00 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '21:00', label: '9:00 PM' },
    { value: '22:00', label: '10:00 PM' },
    { value: '23:00', label: '11:00 PM' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!station) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Station not found</p>
        <Button onClick={() => navigate('/stations')} className="mt-4">
          Back to Stations
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/stations/${id}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Station Schedule</h1>
            <p className="text-sm text-gray-500">{station.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Schedules */}
        <Card>
          <Card.Header>
            <Card.Title>Current Schedules</Card.Title>
          </Card.Header>
          <div className="space-y-4">
            {schedules?.data?.length > 0 ? (
              schedules.data.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{schedule.dayOfWeek}</p>
                      <p className="text-sm text-gray-500">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      disabled={deleteScheduleMutation.isPending}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add a schedule to set operating hours
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Add New Schedule */}
        <Card>
          <Card.Header>
            <Card.Title>Add New Schedule</Card.Title>
          </Card.Header>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <Select
                options={dayOptions}
                value={newSchedule.dayOfWeek}
                onChange={(value) => setNewSchedule({ ...newSchedule, dayOfWeek: value })}
                placeholder="Select day"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <Select
                  options={timeOptions}
                  value={newSchedule.startTime}
                  onChange={(value) => setNewSchedule({ ...newSchedule, startTime: value })}
                  placeholder="Start time"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <Select
                  options={timeOptions}
                  value={newSchedule.endTime}
                  onChange={(value) => setNewSchedule({ ...newSchedule, endTime: value })}
                  placeholder="End time"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={newSchedule.isActive}
                onChange={(e) => setNewSchedule({ ...newSchedule, isActive: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-900">Active Schedule</span>
            </div>

            <Button
              onClick={handleAddSchedule}
              disabled={createScheduleMutation.isPending}
              className="w-full flex items-center justify-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Schedule</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Schedule Information */}
      <Card>
        <Card.Header>
          <Card.Title>Schedule Information</Card.Title>
        </Card.Header>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">How Schedules Work</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Schedules define when the station is available for bookings</li>
              <li>• Multiple schedules can be created for different days</li>
              <li>• Inactive schedules won't accept new bookings</li>
              <li>• Times are in 24-hour format</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default StationScheduleEditor
