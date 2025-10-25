import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { stationsAPI } from '../api/stations'
import { useAuth } from '../app/store.jsx'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Select from '../components/UI/Select'
import Badge from '../components/UI/Badge'
import OperatorSlotBoard from '../features/stations/OperatorSlotBoard'
import SlotMappingDemo from '../features/stations/SlotMappingDemo'
import { 
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ClockIcon
} from '@heroicons/react/24/outline'

const SlotBoardPage = () => {
  const { user } = useAuth()
  const [selectedStationId, setSelectedStationId] = useState('')
  const [showSlotBoard, setShowSlotBoard] = useState(false)
  const [showSlotMappingDemo, setShowSlotMappingDemo] = useState(false)

  // Fetch stations for the current operator
  const { data: stationsData, isLoading: stationsLoading, error: stationsError } = useQuery({
    queryKey: ['stations', user?.userId || user?.id],
    queryFn: () => {
      const params = {}
      if (user?.role === 'StationOperator') {
        params.operatorId = user?.userId || user?.id
      }
      return stationsAPI.getStations(params)
    },
    enabled: !!user
  })

  const handleStationSelect = (stationId) => {
    setSelectedStationId(stationId)
    setShowSlotBoard(true)
  }

  const handleCloseSlotBoard = () => {
    setShowSlotBoard(false)
    setSelectedStationId('')
  }

  const handleShowSlotMappingDemo = () => {
    setShowSlotMappingDemo(true)
  }

  const handleCloseSlotMappingDemo = () => {
    setShowSlotMappingDemo(false)
  }

  if (stationsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (stationsError) {
    return (
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-8">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load stations</p>
        </div>
      </div>
    )
  }

  const stations = stationsData?.data?.items || []

  if (showSlotBoard && selectedStationId) {
    return (
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleCloseSlotBoard}
            className="mb-4"
          >
            ← Back to Station Selection
          </Button>
        </div>
        <OperatorSlotBoard
          stationId={selectedStationId}
          onClose={handleCloseSlotBoard}
        />
      </div>
    )
  }

  if (showSlotMappingDemo) {
    return (
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleCloseSlotMappingDemo}
            className="mb-4"
          >
            ← Back to Slot Board
          </Button>
        </div>
        <SlotMappingDemo />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-8 pt-6 pb-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Slot Board</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage station capacity and schedules for your assigned stations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleShowSlotMappingDemo}
              className="flex items-center space-x-2"
            >
              <ClockIcon className="h-4 w-4" />
              <span>Slot Mapping Demo</span>
            </Button>
            <Squares2X2Icon className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        {/* Station Selection */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Station</h2>
            
            {stations.length === 0 ? (
              <div className="text-center py-8">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Stations Assigned</h3>
                <p className="text-gray-500 mb-4">
                  You don't have any stations assigned to manage.
                </p>
                <p className="text-sm text-gray-400">
                  Contact your administrator to get station assignments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stations.map((station) => (
                    <div
                      key={station.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleStationSelect(station.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{station.name}</h3>
                            <p className="text-sm text-gray-500">{station.customId}</p>
                          </div>
                        </div>
                        <Badge variant={station.isActive ? 'success' : 'danger'}>
                          {station.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Type:</span>
                          <Badge variant="info">{station.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Capacity:</span>
                          <span className="font-medium">
                            {station.availableSlots} / {station.totalSlots} slots
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Location:</span>
                          <span className="text-gray-700 truncate max-w-32">
                            {station.location.address}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => handleStationSelect(station.id)}
                        >
                          <Squares2X2Icon className="h-4 w-4 mr-2" />
                          Open Slot Board
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        {stations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Stations</p>
                    <p className="text-2xl font-bold text-gray-900">{stations.length}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Squares2X2Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Active Stations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stations.filter(s => s.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Capacity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stations.reduce((sum, station) => sum + station.totalSlots, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default SlotBoardPage
