import React from 'react'
import dayjs from 'dayjs'
import Button from '../../components/UI/Button'
import Table from '../../components/UI/Table'
import { XMarkIcon } from '@heroicons/react/24/outline'

const StationScheduleViewer = ({ station, onClose }) => {
  const schedules = station?.schedule || []

  if (!station) return null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Station Schedule (Read-Only)</h3>
        <p className="text-sm text-gray-500">
          Viewing daily schedules for {station.name}. Total slots: {station.totalSlots}
        </p>
        <p className="text-xs text-amber-600 mt-1">
          ⚠️ Only station operators can modify schedules. This is a read-only view.
        </p>
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
              <Table.Head>Status</Table.Head>
            </tr>
          </Table.Header>
          <Table.Body>
            {schedules
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((schedule, index) => {
                const scheduleDate = dayjs(schedule.date)
                const isToday = scheduleDate.isSame(dayjs(), 'day')
                const isPast = scheduleDate.isBefore(dayjs(), 'day')
                const isFuture = scheduleDate.isAfter(dayjs(), 'day')
                
                let status = 'Future'
                let statusColor = 'bg-blue-100 text-blue-800'
                
                if (isPast) {
                  status = 'Past'
                  statusColor = 'bg-gray-100 text-gray-800'
                } else if (isToday) {
                  status = 'Today'
                  statusColor = 'bg-green-100 text-green-800'
                }

                return (
                  <Table.Row key={`${schedule.date}-${index}`}>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span>{scheduleDate.format('MMM DD, YYYY')}</span>
                        {isToday && <span className="text-xs text-green-600 font-medium">Today</span>}
                      </div>
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
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                        {status}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
          </Table.Body>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No schedules found for this station.</p>
          <p className="text-sm mt-1">Station operators can add schedules using the management interface.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          <XMarkIcon className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>
    </div>
  )
}

export default StationScheduleViewer
