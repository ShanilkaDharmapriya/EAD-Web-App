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
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const ownerSchema = z.object({
  nic: z.string().regex(SL_NIC_REGEX, 'Enter a valid Sri Lankan NIC (9 digits + V/X or 12 digits).'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format').max(100, 'Email must be less than 100 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(15, 'Phone must be less than 15 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const OwnersList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOwner, setEditingOwner] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
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

  const handleDeactivate = (nic) => {
    if (window.confirm('Are you sure you want to deactivate this EV owner?')) {
      deactivateMutation.mutate(nic)
    }
  }

  const handleReactivate = (nic) => {
    if (window.confirm('Are you sure you want to reactivate this EV owner?')) {
      reactivateMutation.mutate(nic)
    }
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
          <div className="mb-4">
            <Input
              placeholder="Search by NIC or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(owner)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {owner.isActive ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeactivate(owner.nic)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          ) : isBackoffice ? (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleReactivate(owner.nic)}
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </Button>
                          ) : null}
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
            placeholder="Enter NIC number"
            disabled={!!editingOwner}
          />

          <Input
            label="Full Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Enter full name"
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
            placeholder="Enter phone number"
          />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Enter password"
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
    </div>
  )
}

export default OwnersList
