import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../app/store.jsx'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'

const stationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['AC', 'DC'], 'Please select a valid type'),
  totalSlots: z.number().min(1, 'Total slots must be at least 1').max(50, 'Total slots must be less than 50'),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must be less than 200 characters'),
})

const StationForm = ({ station, onClose, isOpen }) => {
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stationSchema),
    defaultValues: station ? {
      name: station.name,
      type: station.type,
      totalSlots: station.totalSlots,
      latitude: station.location.latitude,
      longitude: station.location.longitude,
      address: station.location.address,
    } : {
      name: '',
      type: '',
      totalSlots: 1,
      latitude: 0,
      longitude: 0,
      address: '',
    }
  })

  const createMutation = useMutation({
    mutationFn: stationsAPI.createStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      showSuccess('Success', 'Charging station created successfully')
      onClose()
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to create charging station')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => stationsAPI.updateStation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      showSuccess('Success', 'Charging station updated successfully')
      onClose()
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to update charging station')
    },
  })

  const onSubmit = (data) => {
    const stationData = {
      name: data.name,
      type: data.type,
      totalSlots: data.totalSlots,
      operatorId: user?.userId || user?.id || '',
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
      },
    }

    if (station) {
      updateMutation.mutate({ id: station.id, data: stationData })
    } else {
      createMutation.mutate(stationData)
    }
  }

  if (!isOpen) return null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Latitude"
          type="number"
          step="any"
          {...register('latitude', { valueAsNumber: true })}
          error={errors.latitude?.message}
          placeholder="Enter latitude"
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          {...register('longitude', { valueAsNumber: true })}
          error={errors.longitude?.message}
          placeholder="Enter longitude"
        />
      </div>

      <Input
        label="Address"
        {...register('address')}
        error={errors.address?.message}
        placeholder="Enter full address"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {station ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

export default StationForm
