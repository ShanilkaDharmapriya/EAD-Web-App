import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ownersAPI } from '../../api/owners'
import { useToast } from '../../hooks/useToast'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import { UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, TruckIcon } from '@heroicons/react/24/outline'

const ownerSchema = z.object({
  nic: z.string().min(1, 'NIC is required'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  licensePlate: z.string().min(1, 'License plate is required'),
  batteryCapacity: z.number().min(1, 'Battery capacity must be at least 1 kWh'),
  chargingType: z.string().min(1, 'Charging type is required')
})

const OwnerForm = () => {
  const { nic } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const isEdit = !!nic

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      batteryCapacity: 50,
      chargingType: 'AC'
    }
  })

  const createOwnerMutation = useMutation({
    mutationFn: (data) => ownersAPI.createOwner(data),
    onSuccess: () => {
      showToast('Owner created successfully', 'success')
      queryClient.invalidateQueries(['owners'])
      navigate('/owners')
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to create owner', 'error')
    }
  })

  const updateOwnerMutation = useMutation({
    mutationFn: ({ nic, data }) => ownersAPI.updateOwner(nic, data),
    onSuccess: () => {
      showToast('Owner updated successfully', 'success')
      queryClient.invalidateQueries(['owners'])
      queryClient.invalidateQueries(['owner', nic])
      navigate('/owners')
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to update owner', 'error')
    }
  })

  const onSubmit = (data) => {
    if (isEdit) {
      updateOwnerMutation.mutate({ nic, data })
    } else {
      createOwnerMutation.mutate(data)
    }
  }

  const vehicleTypeOptions = [
    { value: 'Sedan', label: 'Sedan' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Hatchback', label: 'Hatchback' },
    { value: 'Coupe', label: 'Coupe' },
    { value: 'Convertible', label: 'Convertible' },
    { value: 'Truck', label: 'Truck' },
    { value: 'Van', label: 'Van' },
    { value: 'Motorcycle', label: 'Motorcycle' }
  ]

  const chargingTypeOptions = [
    { value: 'AC', label: 'AC Charging' },
    { value: 'DC', label: 'DC Fast Charging' },
    { value: 'Both', label: 'Both AC and DC' }
  ]

  const batteryCapacityOptions = [
    { value: 20, label: '20 kWh' },
    { value: 30, label: '30 kWh' },
    { value: 40, label: '40 kWh' },
    { value: 50, label: '50 kWh' },
    { value: 60, label: '60 kWh' },
    { value: 70, label: '70 kWh' },
    { value: 80, label: '80 kWh' },
    { value: 100, label: '100 kWh' }
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Owner' : 'Add New Owner'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit 
            ? 'Update owner information' 
            : 'Register a new EV owner in the system'
          }
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIC Number *
                </label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('nic')}
                    placeholder="Enter NIC number"
                    className="pl-10"
                    disabled={isEdit}
                  />
                </div>
                {errors.nic && (
                  <p className="mt-1 text-sm text-red-600">{errors.nic.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('fullName')}
                    placeholder="Enter full name"
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Enter email address"
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('phoneNumber')}
                    placeholder="Enter phone number"
                    className="pl-10"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <Select
                  options={vehicleTypeOptions}
                  onChange={(value) => setValue('vehicleType', value)}
                  placeholder="Select vehicle type"
                />
                {errors.vehicleType && (
                  <p className="mt-1 text-sm text-red-600">{errors.vehicleType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Plate *
                </label>
                <div className="relative">
                  <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('licensePlate')}
                    placeholder="Enter license plate"
                    className="pl-10"
                  />
                </div>
                {errors.licensePlate && (
                  <p className="mt-1 text-sm text-red-600">{errors.licensePlate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Battery Capacity (kWh) *
                </label>
                <Select
                  options={batteryCapacityOptions}
                  onChange={(value) => setValue('batteryCapacity', parseInt(value))}
                  placeholder="Select battery capacity"
                />
                {errors.batteryCapacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.batteryCapacity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charging Type *
                </label>
                <Select
                  options={chargingTypeOptions}
                  onChange={(value) => setValue('chargingType', value)}
                  placeholder="Select charging type"
                />
                {errors.chargingType && (
                  <p className="mt-1 text-sm text-red-600">{errors.chargingType.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/owners')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOwnerMutation.isPending || updateOwnerMutation.isPending}
            >
              {createOwnerMutation.isPending || updateOwnerMutation.isPending
                ? (isEdit ? 'Updating...' : 'Creating...')
                : (isEdit ? 'Update Owner' : 'Create Owner')
              }
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default OwnerForm
