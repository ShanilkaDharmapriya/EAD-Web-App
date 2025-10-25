import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { stationsAPI } from '../../api/stations'
import { usersAPI } from '../../api/users'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../app/store.jsx'
import { getErrorMessage } from '../../utils/errors'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Modal from '../../components/UI/Modal'
import Badge from '../../components/UI/Badge'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import LocationMap from '../../components/UI/LocationMap'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import StationScheduleEditor from './StationScheduleEditor'
import StationScheduleViewer from './StationScheduleViewer'
import StationUtilization from './StationUtilization'
import OperatorSlotBoard from './OperatorSlotBoard'

const stationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['AC', 'DC'], 'Please select a valid type'),
  totalSlots: z.number().min(1, 'Total slots must be at least 1').max(50, 'Total slots must be less than 50'),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must be less than 200 characters'),
  operatorId: z.string().min(1, 'Station operator is required'),
})

const StationsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isUtilizationModalOpen, setIsUtilizationModalOpen] = useState(false)
  const [isSlotBoardModalOpen, setIsSlotBoardModalOpen] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [deactId, setDeactId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMsg, setDialogMsg] = useState("")
  const [dialogAction, setDialogAction] = useState(null) // 'deactivate' or 'delete'
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const isBackoffice = user?.role === 'Backoffice'
  const isStationOperator = user?.role === 'StationOperator'
  const canCreateStations = isStationOperator // Only StationOperator can create stations
  const canManageSchedules = isStationOperator // Only StationOperator can manage schedules
  
  // Monitor dialog state changes
  useEffect(() => {
    if (dialogOpen && dialogAction === 'validation_error') {
      // Validation error dialog is visible
    }
  }, [dialogOpen, dialogAction, dialogMsg])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      name: '',
      type: '',
      totalSlots: 1,
      latitude: 6.9271, // Default to Colombo, Sri Lanka
      longitude: 79.8612,
      address: '',
      operatorId: '',
    }
  })

  const latitude = watch('latitude')
  const longitude = watch('longitude')

  const handleLocationChange = (lat, lng) => {
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  // Fetch stations - filter by operator if user is StationOperator
  const { data: stationsData, isLoading } = useQuery({
    queryKey: ['stations', isStationOperator ? user?.userId || user?.id : null],
    queryFn: () => {
      const params = {}
      if (isStationOperator) {
        params.operatorId = user?.userId || user?.id
      }
      return stationsAPI.getStations(params)
    },
  })

  // Fetch station operators (only for Backoffice when creating/editing stations)
  const { data: operatorsData } = useQuery({
    queryKey: ['users', 'StationOperator'],
    queryFn: () => usersAPI.getUsers({ role: 'StationOperator', pageSize: 100 }),
    enabled: isBackoffice,
  })

  // Create station mutation
  const createMutation = useMutation({
    mutationFn: stationsAPI.createStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      showSuccess('Success', 'Charging station created successfully')
      setIsModalOpen(false)
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to create charging station')
    },
  })

  // Update station mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => stationsAPI.updateStation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      showSuccess('Success', 'Charging station updated successfully')
      setIsModalOpen(false)
      setEditingStation(null)
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to update charging station')
    },
  })

  // Deactivate station mutation
  const deactivateMutation = useMutation({
    mutationFn: stationsAPI.deactivateStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      showSuccess('Success', 'Charging station deactivated successfully')
      setDialogOpen(false)
      setDeactId(null)
    },
    onError: (error) => {
      // This is a fallback for when mutate() is used instead of mutateAsync()
      const errorMessage = getErrorMessage(error)
      showError('Error', errorMessage)
    },
  })

  // Activate station mutation
  const activateMutation = useMutation({
    mutationFn: stationsAPI.activateStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      showSuccess('Success', 'Charging station activated successfully')
    },
    onError: (error) => {
      showError('Error', getErrorMessage(error))
    },
  })

  // Delete station mutation
  const deleteMutation = useMutation({
    mutationFn: stationsAPI.deleteStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      showSuccess('Success', 'Charging station permanently deleted successfully')
      setDialogOpen(false)
      setDeleteId(null)
    },
    onError: (error) => {
      // This is a fallback for when mutate() is used instead of mutateAsync()
      const errorMessage = getErrorMessage(error)
      showError('Error', errorMessage)
    },
  })

  const handleCreate = () => {
    setEditingStation(null)
    const defaultValues = {
      name: '',
      type: '',
      totalSlots: 1,
      latitude: 6.9271,
      longitude: 79.8612,
      address: '',
      operatorId: isStationOperator ? (user?.userId || user?.id) : '',
    }
    reset(defaultValues)
    setIsModalOpen(true)
  }

  const handleEdit = (station) => {
    setEditingStation(station)
    reset({
      name: station.name,
      type: station.type,
      totalSlots: station.totalSlots,
      latitude: station.location.latitude,
      longitude: station.location.longitude,
      address: station.location.address,
      operatorId: station.operatorId || '',
    })
    setIsModalOpen(true)
  }

  const handleSchedule = (station) => {
    setSelectedStation(station)
    setIsScheduleModalOpen(true)
  }

  const handleUtilization = (station) => {
    setSelectedStation(station)
    setIsUtilizationModalOpen(true)
  }

  const handleSlotBoard = (station) => {
    setSelectedStation(station)
    setIsSlotBoardModalOpen(true)
  }

  const handleDeactivate = async (stationId) => {
    try {
      await deactivateMutation.mutateAsync(stationId)
    } catch (error) {
      // Always show the validation error popup for deactivation failures
      setDialogOpen(true)
      setDialogAction('validation_error')
      setDialogMsg("⚠️ Cannot deactivate this station because it has active or future bookings.\n\nPlease wait for all bookings to complete or cancel them before deactivating the station.")
      setDeactId(null)
    }
  }

  const handleDelete = async (stationId) => {
    try {
      await deleteMutation.mutateAsync(stationId)
    } catch (error) {
      // Always show the validation error popup for deletion failures
      setDialogOpen(true)
      setDialogAction('validation_error')
      setDialogMsg("⚠️ Cannot delete this station because it has active or future bookings.\n\nPlease wait for all bookings to complete or cancel them before deleting the station.")
      setDeleteId(null)
    }
  }

  const handleActivate = async (stationId) => {
    try {
      await activateMutation.mutateAsync(stationId)
    } catch {
      // Error is handled by the mutation's onError
    }
  }

  const onSubmit = (data) => {
    const stationData = {
      name: data.name,
      type: data.type,
      totalSlots: data.totalSlots,
      operatorId: data.operatorId,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
      },
    }

    if (editingStation) {
      updateMutation.mutate({ id: editingStation.id, data: stationData })
    } else {
      createMutation.mutate(stationData)
    }
  }

  const stations = stationsData?.data?.items || []
  const operators = operatorsData?.data?.items || []

  return (
    <div className="max-w-7xl mx-auto px-8 pt-6 pb-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Charging Stations</h1>
          <p className="mt-1 text-sm text-gray-500">Manage charging stations and their schedules</p>
        </div>
        {canCreateStations && (
          <Button onClick={handleCreate}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Station
          </Button>
        )}
      </div>

      <Card>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : stations.length === 0 ? (
            <div className="p-6">
              <Table.EmptyState
                title="No charging stations found"
                description="Get started by creating a new charging station."
                action={
                  canCreateStations && (
                    <Button onClick={handleCreate}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Station
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <Table>
              <Table.Header>
                <tr>
                  <Table.Head>ID</Table.Head>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>Slots</Table.Head>
                  <Table.Head>Location</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Created</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </tr>
              </Table.Header>
              <Table.Body>
                {stations.map((station) => (
                    <Table.Row key={station.id}>
                      <Table.Cell className="font-medium">{station.customId}</Table.Cell>
                      <Table.Cell className="font-medium">{station.name}</Table.Cell>
                      <Table.Cell>
                        <Badge variant="info">{station.type}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {station.availableSlots} / {station.totalSlots}
                      </Table.Cell>
                      <Table.Cell className="max-w-xs truncate">
                        {station.location.address}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={station.isActive ? 'success' : 'danger'}>
                          {station.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(station.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2 flex-nowrap">
                          {/* Activate/Deactivate Button */}
                          {isBackoffice && (
                            <Button
                              variant={station.isActive ? 'warning' : 'success'}
                              size="sm"
                              onClick={() => {
                                if (station.isActive) {
                                  setDeactId(station.id)
                                  setDialogAction('deactivate')
                                  setDialogMsg("Are you sure you want to deactivate this station?")
                                  setDialogOpen(true)
                                } else {
                                  handleActivate(station.id)
                                }
                              }}
                              title={station.isActive ? 'Deactivate station' : 'Activate station'}
                              className="min-w-[100px]"
                            >
                              {station.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                          
                          <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(station)}
                              title="Edit station"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            
                            {/* Schedule Button */}
                            {canManageSchedules ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSchedule(station)}
                                title="Manage schedule"
                              >
                                <Cog6ToothIcon className="h-4 w-4" />
                              </Button>
                            ) : isBackoffice ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSchedule(station)}
                                title="View schedule (read-only)"
                              >
                                <Cog6ToothIcon className="h-4 w-4" />
                              </Button>
                            ) : null}

                            {/* Utilization Button */}
                            {(isBackoffice || isStationOperator) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUtilization(station)}
                                title="View utilization data"
                              >
                                <ChartBarIcon className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Slot Board Button */}
                            {isStationOperator && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSlotBoard(station)}
                                title="Open slot board"
                              >
                                <CalendarDaysIcon className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Delete Button */}
                            {isBackoffice && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setDeleteId(station.id)
                                  setDialogAction('delete')
                                  setDialogMsg("Are you sure you want to permanently delete this station? This action cannot be undone.")
                                  setDialogOpen(true)
                                }}
                                title="Delete station permanently"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </Card>

      {/* Station Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStation ? 'Edit Station' : 'Create Station'}
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Form inputs */}
            <div className="space-y-4">
              <Input
                label="Station Name"
                {...register('name')}
                error={errors.name?.message}
                placeholder="Enter station name"
              />

              <Select
                label="Type"
                {...register('type')}
                error={errors.type?.message}
                options={[
                  { value: 'AC', label: 'AC (Alternating Current)' },
                  { value: 'DC', label: 'DC (Direct Current)' },
                ]}
                placeholder="Select station type"
              />

              <Input
                label="Total Slots"
                type="number"
                {...register('totalSlots', { valueAsNumber: true })}
                error={errors.totalSlots?.message}
                placeholder="Enter total number of slots"
                min="1"
                max="50"
              />

              {isBackoffice ? (
                <Select
                  label="Station Operator"
                  {...register('operatorId')}
                  error={errors.operatorId?.message}
                  options={operators.map(op => ({
                    value: op.id,
                    label: op.username
                  }))}
                  placeholder="Select station operator"
                />
              ) : (
                <input type="hidden" {...register('operatorId')} />
              )}

              <Input
                label="Address"
                {...register('address')}
                error={errors.address?.message}
                placeholder="Enter full address"
              />
            </div>

            {/* Right side - Location map */}
            <div className="space-y-4">
              <LocationMap
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationChange}
                height="400px"
                className="w-full"
              />
              
              {/* Hidden inputs for form validation */}
              <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
              <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
              
              {errors.latitude && (
                <p className="text-red-500 text-sm mt-1">{errors.latitude.message}</p>
              )}
              {errors.longitude && (
                <p className="text-red-500 text-sm mt-1">{errors.longitude.message}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingStation ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`${canManageSchedules ? 'Manage' : 'View'} Schedule - ${selectedStation?.name}`}
        size="xl"
      >
        {canManageSchedules ? (
          <StationScheduleEditor
            station={selectedStation}
            onClose={() => setIsScheduleModalOpen(false)}
          />
        ) : (
          <StationScheduleViewer
            station={selectedStation}
            onClose={() => setIsScheduleModalOpen(false)}
          />
        )}
      </Modal>

      {/* Utilization Modal */}
      <Modal
        isOpen={isUtilizationModalOpen}
        onClose={() => setIsUtilizationModalOpen(false)}
        title={`Utilization - ${selectedStation?.name}`}
        size="4xl"
      >
        <StationUtilization
          stationId={selectedStation?.id}
          onClose={() => setIsUtilizationModalOpen(false)}
        />
      </Modal>

      {/* Slot Board Modal */}
      <Modal
        isOpen={isSlotBoardModalOpen}
        onClose={() => setIsSlotBoardModalOpen(false)}
        title={`Slot Board - ${selectedStation?.name}`}
        size="6xl"
      >
        <OperatorSlotBoard
          stationId={selectedStation?.id}
          onClose={() => setIsSlotBoardModalOpen(false)}
        />
      </Modal>

      {/* Confirmation Dialog */}
      {dialogOpen && (
        <ConfirmDialog
          title={
            dialogAction === 'delete' ? "Delete Station" : 
            dialogAction === 'validation_error' ? "Cannot Modify Station" :
            "Deactivate Station"
          }
          message={dialogMsg}
          isOpen={dialogOpen}
          onCancel={dialogAction === 'validation_error' ? undefined : () => { 
            setDialogOpen(false); 
            setDeactId(null); 
            setDeleteId(null);
            setDialogAction(null);
          }}
          onConfirm={async () => {
            if (dialogAction === 'delete' && deleteId) {
              await handleDelete(deleteId)
            } else if (dialogAction === 'deactivate' && deactId) {
              await handleDeactivate(deactId)
            } else if (dialogAction === 'validation_error') {
              // For validation errors, just close the dialog
              setDialogOpen(false)
              setDialogAction(null)
            } else {
              setDialogOpen(false)
            }
          }}
          confirmText={dialogAction === 'validation_error' ? 'OK' : undefined}
          cancelText={dialogAction === 'validation_error' ? undefined : 'Cancel'}
        />
      )}
      </div>
    </div>
  )
}

export default StationsList
