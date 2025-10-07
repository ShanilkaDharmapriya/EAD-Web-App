import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { stationsAPI } from '../../api/stations'
import { useToast } from '../../hooks/useToast'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Textarea from '../../components/UI/Textarea'
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  WifiIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

const stationSchema = z.object({
  name: z.string().min(1, 'Station name is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  operatingHours: z.string().min(1, 'Operating hours are required'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive'),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  chargingTypes: z.array(z.string()).min(1, 'At least one charging type is required'),
  maxCapacity: z.number().min(1, 'Max capacity must be at least 1'),
  isActive: z.boolean()
})

const StationForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [selectedChargingTypes, setSelectedChargingTypes] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      hourlyRate: 2.50,
      maxCapacity: 4,
      isActive: true
    }
  })

  const createStationMutation = useMutation({
    mutationFn: (data) => stationsAPI.createStation(data),
    onSuccess: () => {
      showToast('Station created successfully', 'success')
      queryClient.invalidateQueries(['stations'])
      navigate('/stations')
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to create station', 'error')
    }
  })

  const updateStationMutation = useMutation({
    mutationFn: ({ id, data }) => stationsAPI.updateStation(id, data),
    onSuccess: () => {
      showToast('Station updated successfully', 'success')
      queryClient.invalidateQueries(['stations'])
      queryClient.invalidateQueries(['station', id])
      navigate('/stations')
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to update station', 'error')
    }
  })

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amenities: selectedAmenities,
      chargingTypes: selectedChargingTypes
    }
    
    if (isEdit) {
      updateStationMutation.mutate({ id, data: formData })
    } else {
      createStationMutation.mutate(formData)
    }
  }

  const amenityOptions = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'restroom', label: 'Restroom' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'parking', label: 'Parking' },
    { value: 'security', label: 'Security' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'restaurant', label: 'Restaurant' }
  ]

  const chargingTypeOptions = [
    { value: 'AC', label: 'AC Charging' },
    { value: 'DC', label: 'DC Fast Charging' },
    { value: 'Both', label: 'Both AC and DC' }
  ]

  const operatingHoursOptions = [
    { value: '24/7', label: '24/7' },
    { value: '6AM-10PM', label: '6:00 AM - 10:00 PM' },
    { value: '7AM-9PM', label: '7:00 AM - 9:00 PM' },
    { value: '8AM-8PM', label: '8:00 AM - 8:00 PM' }
  ]

  const handleAmenityChange = (amenity) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity]
    setSelectedAmenities(newAmenities)
  }

  const handleChargingTypeChange = (type) => {
    const newTypes = selectedChargingTypes.includes(type)
      ? selectedChargingTypes.filter(t => t !== type)
      : [...selectedChargingTypes, type]
    setSelectedChargingTypes(newTypes)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Station' : 'Add New Station'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit 
            ? 'Update station information' 
            : 'Register a new charging station'
          }
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station Name *
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('name')}
                    placeholder="Enter station name"
                    className="pl-10"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('location')}
                    placeholder="Enter location"
                    className="pl-10"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <Input
                  {...register('address')}
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operating Hours *
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select
                    options={operatingHoursOptions}
                    onChange={(value) => setValue('operatingHours', value)}
                    placeholder="Select operating hours"
                  />
                </div>
                {errors.operatingHours && (
                  <p className="mt-1 text-sm text-red-600">{errors.operatingHours.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Capacity *
                </label>
                <Input
                  {...register('maxCapacity', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="Enter max capacity"
                />
                {errors.maxCapacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxCapacity.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (USD) *
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('hourlyRate', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter hourly rate"
                    className="pl-10"
                  />
                </div>
                {errors.hourlyRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Charging Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Charging Types *</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chargingTypeOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedChargingTypes.includes(option.value)}
                    onChange={() => handleChargingTypeChange(option.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.chargingTypes && (
              <p className="mt-1 text-sm text-red-600">{errors.chargingTypes.message}</p>
            )}
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {amenityOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(option.value)}
                    onChange={() => handleAmenityChange(option.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              {...register('description')}
              rows={4}
              placeholder="Enter station description..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                {...register('isActive')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-900">Active Station</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/stations')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStationMutation.isPending || updateStationMutation.isPending}
            >
              {createStationMutation.isPending || updateStationMutation.isPending
                ? (isEdit ? 'Updating...' : 'Creating...')
                : (isEdit ? 'Update Station' : 'Create Station')
              }
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default StationForm
