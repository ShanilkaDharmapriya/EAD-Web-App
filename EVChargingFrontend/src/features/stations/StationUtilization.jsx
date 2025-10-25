import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { stationsAPI } from '../../api/stations'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Badge from '../../components/UI/Badge'
import Button from '../../components/UI/Button'
import { 
  CalendarDaysIcon, 
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const StationUtilization = ({ stationId, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const { data: utilizationData, isLoading, error } = useQuery({
    queryKey: ['stationUtilization', stationId],
    queryFn: () => stationsAPI.getStationUtilization(stationId),
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
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load utilization data</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    )
  }

  const utilization = utilizationData?.data
  if (!utilization) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No utilization data available</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    )
  }

  // Filter data for selected date
  const selectedDateData = utilization.hourlyData.filter(item => {
    const itemDate = new Date(item.dateTime).toISOString().split('T')[0]
    return itemDate === selectedDate
  })

  const getUtilizationBadge = (utilization) => {
    if (utilization >= 90) return <Badge variant="danger">{utilization.toFixed(1)}%</Badge>
    if (utilization >= 70) return <Badge variant="warning">{utilization.toFixed(1)}%</Badge>
    if (utilization >= 50) return <Badge variant="info">{utilization.toFixed(1)}%</Badge>
    return <Badge variant="success">{utilization.toFixed(1)}%</Badge>
  }

  const getAvailabilityBadge = (available, total) => {
    if (available === 0) return <Badge variant="danger">Full</Badge>
    if (available <= total * 0.2) return <Badge variant="warning">{available}/{total}</Badge>
    return <Badge variant="success">{available}/{total}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Station Utilization</h2>
          <p className="text-sm text-gray-500">{utilization.stationName}</p>
        </div>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>

      {/* Station Info */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Capacity</p>
              <p className="text-lg font-semibold">{utilization.totalSlots} slots</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Working Hours</p>
              <p className="text-lg font-semibold">
                {utilization.openTime} - {utilization.closeTime}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Next 7 Days</p>
              <p className="text-lg font-semibold">View Available</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Date Selector */}
      <Card>
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* Hourly Utilization Table */}
      <Card>
        <Card.Header>
          <Card.Title>Hourly Utilization - {new Date(selectedDate).toLocaleDateString()}</Card.Title>
        </Card.Header>
        <Table>
          <Table.Header>
            <tr>
              <Table.Head>Time</Table.Head>
              <Table.Head>Approved</Table.Head>
              <Table.Head>Pending</Table.Head>
              <Table.Head>Available</Table.Head>
              <Table.Head>Utilization</Table.Head>
            </tr>
          </Table.Header>
          <Table.Body>
            {selectedDateData.length === 0 ? (
              <Table.EmptyState
                title="No data for selected date"
                description="No bookings found for the selected date."
              />
            ) : (
              selectedDateData.map((hour) => (
                <Table.Row key={hour.hourKey}>
                  <Table.Cell className="font-medium">
                    {new Date(hour.dateTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="success">{hour.approvedCount}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="warning">{hour.pendingCount}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {getAvailabilityBadge(hour.availableSlots, hour.totalCapacity)}
                  </Table.Cell>
                  <Table.Cell>
                    {getUtilizationBadge(hour.utilizationPercentage)}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Summary Stats */}
      {selectedDateData.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Daily Summary</Card.Title>
          </Card.Header>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {selectedDateData.reduce((sum, hour) => sum + hour.approvedCount, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {selectedDateData.reduce((sum, hour) => sum + hour.pendingCount, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {selectedDateData.reduce((sum, hour) => sum + hour.availableSlots, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Available</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {(selectedDateData.reduce((sum, hour) => sum + hour.utilizationPercentage, 0) / selectedDateData.length).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">Avg Utilization</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default StationUtilization
