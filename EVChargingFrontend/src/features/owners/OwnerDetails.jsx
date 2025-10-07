import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ownersAPI } from '../../api/owners'
import { useToast } from '../../hooks/useToast'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import Modal from '../../components/UI/Modal'
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const OwnerDetails = () => {
  const { nic } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: owner, isLoading } = useQuery({
    queryKey: ['owner', nic],
    queryFn: () => ownersAPI.getOwner(nic),
    enabled: !!nic
  })

  const deleteOwnerMutation = useMutation({
    mutationFn: () => ownersAPI.deleteOwner(nic),
    onSuccess: () => {
      queryClient.invalidateQueries(['owners'])
      showToast('Owner deleted successfully', 'success')
      navigate('/owners')
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to delete owner', 'error')
    }
  })

  const handleDelete = () => {
    deleteOwnerMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Owner not found</p>
        <Button onClick={() => navigate('/owners')} className="mt-4">
          Back to Owners
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
            onClick={() => navigate('/owners')}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Details</h1>
            <p className="text-sm text-gray-500">NIC: {owner.nic}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/owners/${owner.nic}/edit`)}
          >
            Edit Owner
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Owner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <Card.Header>
              <Card.Title>Personal Information</Card.Title>
            </Card.Header>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Full Name</p>
                    <p className="text-sm text-gray-500">{owner.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">NIC</p>
                    <p className="text-sm text-gray-500">{owner.nic}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-500">{owner.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <Card.Header>
              <Card.Title>Vehicle Information</Card.Title>
            </Card.Header>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Vehicle Type</p>
                  <p className="text-sm text-gray-500">{owner.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">License Plate</p>
                  <p className="text-sm text-gray-500">{owner.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Battery Capacity</p>
                  <p className="text-sm text-gray-500">{owner.batteryCapacity} kWh</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Charging Type</p>
                  <p className="text-sm text-gray-500">{owner.chargingType}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <Card.Header>
              <Card.Title>Status</Card.Title>
            </Card.Header>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-900">Active Owner</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Member Since</p>
                  <p className="text-sm text-gray-500">
                    {new Date(owner.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card>
            <Card.Header>
              <Card.Title>Quick Stats</Card.Title>
            </Card.Header>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Bookings</span>
                <span className="text-sm font-medium text-gray-900">
                  {owner.totalBookings || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Completed</span>
                <span className="text-sm font-medium text-gray-900">
                  {owner.completedBookings || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Pending</span>
                <span className="text-sm font-medium text-gray-900">
                  {owner.pendingBookings || 0}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Owner"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this owner? This action cannot be undone and will remove all associated data.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteOwnerMutation.isPending}
            >
              {deleteOwnerMutation.isPending ? 'Deleting...' : 'Delete Owner'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default OwnerDetails
