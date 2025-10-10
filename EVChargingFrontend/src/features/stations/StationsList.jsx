import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { stationsAPI } from '../../api/stations'
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
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LoadingButton from '../../components/ui/LoadingButton'
import LocationMap from '../../components/UI/LocationMap'
import { PlusIcon, PencilIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import StationScheduleEditor from './StationScheduleEditor'

const stationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['AC', 'DC'], 'Please select a valid type'),
  totalSlots: z.number().min(1, 'Total slots must be at least 1').max(50, 'Total slots must be less than 50'),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must be less than 200 characters'),
})

const StationsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [deactId, setDeactId] = useState(null)
  const [deactLoading, setDeactLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMsg, setDialogMsg] = useState("")
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const isBackoffice = user?.role === 'Backoffice'
  const canManageStations = user?.role === 'Backoffice' || user?.role === 'StationOperator'

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
    }
  })

  const latitude = watch('latitude')
  const longitude = watch('longitude')

  const handleLocationChange = (lat, lng) => {
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  // Fetch stations
  const { data: stationsData, isLoading } = useQuery({
    queryKey: ['stations'],
    queryFn: () => stationsAPI.getStations(),
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
    },
    onError: (error) => {
      showError('Error', getErrorMessage(error))
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

  const handleCreate = () => {
    setEditingStation(null)
    reset()
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
    })
    setIsModalOpen(true)
  }

  const handleSchedule = (station) => {
    setSelectedStation(station)
    setIsScheduleModalOpen(true)
  }

  const handleDeactivate = async (stationId) => {
    setDeactLoading(true)
    try {
      await deactivateMutation.mutateAsync(stationId)
      setDialogOpen(false)
      setDeactId(null)
    } catch (error) {
      // Error is handled by the mutation's onError, but we need to close the dialog
      setDialogOpen(false)
      setDeactId(null)
    } finally {
      setDeactLoading(false)
    }
  }

  const handleActivate = async (stationId) => {
    try {
      await activateMutation.mutateAsync(stationId)
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  }

  const onSubmit = (data) => {
    // Debug: Log user object to see what's available
    console.log('Current user object:', user)
    console.log('User userId:', user?.userId)
    console.log('User id:', user?.id)
    console.log('User username:', user?.username)
    
    const operatorId = user?.userId || user?.id || user?.username || ''
    console.log('Using operatorId:', operatorId)
    
    const stationData = {
      name: data.name,
      type: data.type,
      totalSlots: data.totalSlots,
      operatorId: operatorId,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Charging Stations</h1>
          <p className="mt-1 text-sm text-gray-500">Manage charging stations and their schedules</p>
        </div>
        {canManageStations && (
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
                  canManageStations && (
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
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(station)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSchedule(station)}
                          >
                            <Cog6ToothIcon className="h-4 w-4" />
                          </Button>
                          {isBackoffice && (
                            <>
                              {station.isActive ? (
                                <LoadingButton
                                  aria-label="Deactivate station"
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  size="sm"
                                  loading={deactLoading}
                                  onClick={() => {
                                    setDeactId(station.id)
                                    setDialogMsg("Are you sure you want to deactivate this station? This action cannot be undone.")
                                    setDialogOpen(true)
                                  }}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </LoadingButton>
                              ) : (
                                <LoadingButton
                                  aria-label="Activate station"
                                  className="bg-green-600 text-white hover:bg-green-700"
                                  size="sm"
                                  loading={activateMutation.isPending}
                                  onClick={() => handleActivate(station.id)}
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </LoadingButton>
                              )}
                            </>
                          )}
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
        title={`Schedule - ${selectedStation?.name}`}
        size="xl"
      >
        <StationScheduleEditor
          station={selectedStation}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      </Modal>

      {/* Deactivation Confirmation Dialog */}
      <ConfirmDialog
        title="Station Deactivation"
        message={dialogMsg}
        isOpen={dialogOpen}
        onCancel={() => { setDialogOpen(false); setDeactId(null) }}
        onConfirm={async () => {
          if (!deactId) { setDialogOpen(false); return }
          await handleDeactivate(deactId)
        }}
      />
    </div>
  )
}

export default StationsList
