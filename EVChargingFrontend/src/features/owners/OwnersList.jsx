import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ownersAPI } from '../../api/owners'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../app/store.jsx'
import { SL_NIC_REGEX } from '../../utils/nic'
import { getErrorMessage } from '../../utils/errors'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Modal from '../../components/UI/Modal'
import Badge from '../../components/UI/Badge'
import Pagination from '../../components/UI/Pagination'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'

const ownerSchema = z.object({
  nic: z.string().regex(SL_NIC_REGEX, 'Enter a valid Sri Lankan NIC (9 digits + V/X or 12 digits).'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters'),
  phone: z.string()
    .min(10, 'Phone must be at least 10 characters')
    .max(15, 'Phone must be at most 15 characters')
    .regex(/^[0-9+\-\s()]+$/, 'Phone can only contain numbers, spaces, and phone symbols (+, -, (), spaces)'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one digit'),
})

const OwnersList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOwner, setEditingOwner] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, nic: null, isActive: false })
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const isBackoffice = user?.role === 'Backoffice'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ownerSchema),
  })

  // Fetch owners
  const { data: ownersData, isLoading } = useQuery({
    queryKey: ['owners', { page: currentPage, size: 10, search: searchTerm }],
    queryFn: () => ownersAPI.getOwners({ page: currentPage, size: 10, search: searchTerm }),
  })

  // Create owner mutation
  const createMutation = useMutation({
    mutationFn: ownersAPI.createOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      showSuccess('Success', 'EV Owner created successfully')
      setIsModalOpen(false)
      reset()
    },
    onError: (error) => {
      showError('Error', getErrorMessage(error))
    },
  })

  // Update owner mutation
  const updateMutation = useMutation({
    mutationFn: ({ nic, data }) => ownersAPI.updateOwner(nic, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      showSuccess('Success', 'EV Owner updated successfully')
      setIsModalOpen(false)
      setEditingOwner(null)
      reset()
    },
    onError: (error) => {
      showError('Error', getErrorMessage(error))
    },
  })

  // Deactivate owner mutation
  const deactivateMutation = useMutation({
    mutationFn: ownersAPI.deactivateOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      showSuccess('Success', 'EV Owner deactivated successfully')
    },
    onError: (error) => {
      showError('Error', getErrorMessage(error))
    },
  })

  // Reactivate owner mutation
  const reactivateMutation = useMutation({
    mutationFn: ownersAPI.reactivateOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      showSuccess('Success', 'EV Owner reactivated successfully')
    },
    onError: (error) => {
      showError('Error', getErrorMessage(error))
    },
  })

  // Delete owner mutation
  const deleteMutation = useMutation({
    mutationFn: ownersAPI.deleteOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      showSuccess('Success', 'EV Owner deleted successfully')
    },
    onError: (error) => {
      showError('Error', getErrorMessage(error))
    },
  })

  const handleCreate = () => {
    setEditingOwner(null)
    reset()
    setIsModalOpen(true)
  }

  const handleEdit = (owner) => {
    setEditingOwner(owner)
    reset({
      nic: owner.nic,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      password: '', // Don't pre-fill password
    })
    setIsModalOpen(true)
  }

  const handleStatusToggle = (nic, isActive) => {
    setConfirmDialog({
      isOpen: true,
      action: isActive ? 'deactivate' : 'reactivate',
      nic,
      isActive
    })
  }

  const handleDelete = (nic) => {
    setConfirmDialog({
      isOpen: true,
      action: 'delete',
      nic,
      isActive: false
    })
  }

  const handleConfirm = () => {
    if (confirmDialog.action === 'deactivate') {
      deactivateMutation.mutate(confirmDialog.nic)
    } else if (confirmDialog.action === 'reactivate') {
      reactivateMutation.mutate(confirmDialog.nic)
    } else if (confirmDialog.action === 'delete') {
      deleteMutation.mutate(confirmDialog.nic)
    }
    setConfirmDialog({ isOpen: false, action: null, nic: null, isActive: false })
  }

  const handleCancelConfirm = () => {
    setConfirmDialog({ isOpen: false, action: null, nic: null, isActive: false })
  }

  const onSubmit = (data) => {
    if (editingOwner) {
      updateMutation.mutate({ nic: editingOwner.nic, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const owners = ownersData?.data?.items || []
  const totalPages = ownersData?.data?.totalPages || 1

  return (
    <div className="max-w-7xl mx-auto px-8 pt-6 pb-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">EV Owners</h1>
          <p className="mt-1 text-sm text-gray-500">Manage electric vehicle owners and their accounts</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Owner
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="Search by NIC, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <tr>
                  <Table.Head>NIC</Table.Head>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Email</Table.Head>
                  <Table.Head>Phone</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Created</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </tr>
              </Table.Header>
              <Table.Body>
                {owners.length === 0 ? (
                  <Table.EmptyState
                    title="No EV owners found"
                    description="Get started by creating a new EV owner."
                    action={
                      <Button onClick={handleCreate}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Owner
                      </Button>
                    }
                  />
                ) : (
                  owners.map((owner) => (
                    <Table.Row key={owner.nic}>
                      <Table.Cell className="font-medium">{owner.nic}</Table.Cell>
                      <Table.Cell>{owner.name}</Table.Cell>
                      <Table.Cell>{owner.email}</Table.Cell>
                      <Table.Cell>{owner.phone}</Table.Cell>
                      <Table.Cell>
                        <Badge variant={owner.isActive ? 'success' : 'danger'}>
                          {owner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(owner.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2 flex-nowrap">
                          {/* Activate/Deactivate Button */}
                          {isBackoffice && (
                            <Button
                              variant={owner.isActive ? 'warning' : 'success'}
                              size="sm"
                              onClick={() => handleStatusToggle(owner.nic, owner.isActive)}
                              title={owner.isActive ? 'Deactivate owner' : 'Activate owner'}
                              className="min-w-[100px]"
                            >
                              {owner.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                          
                          <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(owner)}
                              title="Edit owner"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            
                            {/* Delete Button */}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(owner.nic)}
                              title="Delete owner permanently"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Owner Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOwner ? 'Edit EV Owner' : 'Create EV Owner'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="NIC"
            {...register('nic')}
            error={errors.nic?.message}
            placeholder="e.g., 123456789V or 200012345678"
            disabled={!!editingOwner}
          />

          <Input
            label="Full Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Enter full name (letters and spaces only)"
          />

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter email address"
          />

          <Input
            label="Phone"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="e.g., 0771234567 or +94771234567"
          />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Min 6 chars, include A-Z, a-z, 0-9"
          />

          <div className="flex justify-end space-x-3 pt-4">
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
              {editingOwner ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.action === 'delete'
            ? 'Delete EV Owner'
            : confirmDialog.action === 'deactivate'
            ? 'Deactivate EV Owner'
            : 'Reactivate EV Owner'
        }
        message={
          confirmDialog.action === 'delete'
            ? 'Are you sure you want to permanently delete this EV owner? This action cannot be undone.'
            : confirmDialog.action === 'deactivate'
            ? 'Are you sure you want to deactivate this EV owner? They will not be able to make new bookings.'
            : 'Are you sure you want to reactivate this EV owner? They will be able to make bookings again.'
        }
        confirmText={
          confirmDialog.action === 'delete'
            ? 'Delete'
            : confirmDialog.action === 'deactivate'
            ? 'Deactivate'
            : 'Reactivate'
        }
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
      </div>
    </div>
  )
}

export default OwnersList
