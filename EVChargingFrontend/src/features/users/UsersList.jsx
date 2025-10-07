import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usersAPI } from '../../api/users'
import { useToast } from '../../hooks/useToast'
import Card from '../../components/UI/Card'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Modal from '../../components/UI/Modal'
import Badge from '../../components/UI/Badge'
import Pagination from '../../components/UI/Pagination'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Backoffice', 'StationOperator'], 'Please select a valid role'),
})

const UsersList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
  })

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', { page: currentPage, size: 10, search: searchTerm }],
    queryFn: () => usersAPI.getUsers({ page: currentPage, size: 10, search: searchTerm }),
  })

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: usersAPI.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showSuccess('Success', 'User created successfully')
      setIsModalOpen(false)
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to create user')
    },
  })

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showSuccess('Success', 'User updated successfully')
      setIsModalOpen(false)
      setEditingUser(null)
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to update user')
    },
  })

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: usersAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showSuccess('Success', 'User deleted successfully')
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to delete user')
    },
  })

  const handleCreate = () => {
    setEditingUser(null)
    reset()
    setIsModalOpen(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    reset({
      username: user.username,
      role: user.role,
      password: '', // Don't pre-fill password
    })
    setIsModalOpen(true)
  }

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId)
    }
  }

  const onSubmit = (data) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const users = usersData?.data?.items || []
  const totalPages = usersData?.data?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage system users and their roles</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="mb-4">
            <Input
              placeholder="Search users..."
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
                  <Table.Head>Username</Table.Head>
                  <Table.Head>Role</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Created</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </tr>
              </Table.Header>
              <Table.Body>
                {users.length === 0 ? (
                  <Table.EmptyState
                    title="No users found"
                    description="Get started by creating a new user."
                    action={
                      <Button onClick={handleCreate}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    }
                  />
                ) : (
                  users.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.Cell className="font-medium">{user.username}</Table.Cell>
                      <Table.Cell>
                        <Badge variant="info">{user.role}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
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

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Username"
            {...register('username')}
            error={errors.username?.message}
            placeholder="Enter username"
          />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Enter password"
          />

          <Select
            label="Role"
            {...register('role')}
            error={errors.role?.message}
            options={[
              { value: 'Backoffice', label: 'Backoffice' },
              { value: 'StationOperator', label: 'Station Operator' },
            ]}
            placeholder="Select role"
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
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UsersList
