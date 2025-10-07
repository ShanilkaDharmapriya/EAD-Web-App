import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '../../api/users'
import { useToast } from '../../hooks/useToast'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Backoffice', 'StationOperator'], 'Please select a valid role'),
})

const UserForm = ({ user, onClose, isOpen }) => {
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      username: user.username,
      role: user.role,
      password: '', // Don't pre-fill password
    } : {
      username: '',
      role: '',
      password: '',
    }
  })

  const createMutation = useMutation({
    mutationFn: usersAPI.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showSuccess('Success', 'User created successfully')
      onClose()
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to create user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showSuccess('Success', 'User updated successfully')
      onClose()
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to update user')
    },
  })

  const onSubmit = (data) => {
    if (user) {
      updateMutation.mutate({ id: user.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  if (!isOpen) return null

  return (
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
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {user ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

export default UserForm
