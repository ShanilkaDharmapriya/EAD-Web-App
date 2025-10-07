import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs from 'dayjs'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Table from '../../components/UI/Table'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const scheduleSchema = z.object({
  date: z.date(),
  open: z.string().min(1, 'Opening time is required'),
  close: z.string().min(1, 'Closing time is required'),
  slotsAvailable: z.number().min(0, 'Slots available must be 0 or greater'),
}).refine((data) => {
  const openTime = dayjs(`2000-01-01 ${data.open}`)
  const closeTime = dayjs(`2000-01-01 ${data.close}`)
  return closeTime.isAfter(openTime)
}, {
  message: "Closing time must be after opening time",
  path: ["close"]
})

const StationScheduleEditor = ({ station, onClose }) => {
  const [schedules, setSchedules] = useState([])
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(scheduleSchema),
  })

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: (data) => stationsAPI.updateStationSchedule(station.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      showSuccess('Success', 'Station schedule updated successfully')
      onClose()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to update schedule')
    },
  })

  useEffect(() => {
    if (station?.schedule) {
      setSchedules(station.schedule)
    }
  }, [station])

  const addSchedule = (data) => {
    const newSchedule = {
      date: dayjs(data.date).format('YYYY-MM-DD'),
      open: data.open,
      close: data.close,
      slotsAvailable: data.slotsAvailable,
    }

    // Check if date already exists
    const existingIndex = schedules.findIndex(s => s.date === newSchedule.date)
    if (existingIndex >= 0) {
      // Update existing schedule
      const updatedSchedules = [...schedules]
      updatedSchedules[existingIndex] = newSchedule
      setSchedules(updatedSchedules)
    } else {
      // Add new schedule
      setSchedules([...schedules, newSchedule])
    }

    reset()
  }

  const removeSchedule = (index) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index)
    setSchedules(updatedSchedules)
  }

  const onSubmit = () => {
    // Transform schedules to match backend format
    const scheduleData = {
      schedule: schedules.map(schedule => ({
        date: dayjs(schedule.date).format('YYYY-MM-DD'),
        open: schedule.open,
        close: schedule.close,
        slotsAvailable: schedule.slotsAvailable
      }))
    }
    updateScheduleMutation.mutate(scheduleData)
  }

  const validateSlotsAvailable = (value, totalSlots) => {
    const numValue = parseInt(value)
    return numValue <= totalSlots
  }

  if (!station) return null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Station Schedule</h3>
        <p className="text-sm text-gray-500">
          Manage daily schedules for {station.name}. Total slots: {station.totalSlots}
        </p>
      </div>

      {/* Add Schedule Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Add/Update Schedule</h4>
        <form onSubmit={handleSubmit(addSchedule)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Date"
            type="date"
            {...register('date', { valueAsDate: true })}
            error={errors.date?.message}
            min={dayjs().format('YYYY-MM-DD')}
          />

          <Input
            label="Opening Time"
            type="time"
            {...register('open')}
            error={errors.open?.message}
          />

          <Input
            label="Closing Time"
            type="time"
            {...register('close')}
            error={errors.close?.message}
          />

          <div className="flex items-end">
            <Input
              label="Slots Available"
              type="number"
              {...register('slotsAvailable', { 
                valueAsNumber: true,
                validate: (value) => validateSlotsAvailable(value, station.totalSlots) || `Must be ≤ ${station.totalSlots}`
              })}
              error={errors.slotsAvailable?.message}
              min="0"
              max={station.totalSlots}
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" size="sm">
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </form>
      </div>

      {/* Schedule List */}
      {schedules.length > 0 ? (
        <Table>
          <Table.Header>
            <tr>
              <Table.Head>Date</Table.Head>
              <Table.Head>Opening Time</Table.Head>
              <Table.Head>Closing Time</Table.Head>
              <Table.Head>Slots Available</Table.Head>
              <Table.Head>Actions</Table.Head>
            </tr>
          </Table.Header>
          <Table.Body>
            {schedules
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((schedule, index) => (
                <Table.Row key={`${schedule.date}-${index}`}>
                  <Table.Cell>
                    {dayjs(schedule.date).format('MMM DD, YYYY')}
                  </Table.Cell>
                  <Table.Cell>{schedule.open}</Table.Cell>
                  <Table.Cell>{schedule.close}</Table.Cell>
                  <Table.Cell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.slotsAvailable > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {schedule.slotsAvailable}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeSchedule(index)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No schedules added yet. Add a schedule above to get started.
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          loading={updateScheduleMutation.isPending}
        >
          Save Schedule
        </Button>
      </div>
    </div>
  )
}

export default StationScheduleEditor
