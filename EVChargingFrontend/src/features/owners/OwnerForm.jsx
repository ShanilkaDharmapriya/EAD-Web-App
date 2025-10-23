import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ownersAPI } from '../../api/owners'
import { useToast } from '../../hooks/useToast'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'

const ownerSchema = z.object({
  nic: z.string()
    .min(10, 'NIC must be at least 10 characters')
    .max(12, 'NIC must be at most 12 characters')
    .regex(/^[0-9]{9}[VX]$|^[0-9]{12}$/, 'NIC must be in Sri Lankan format (9 digits + V/X or 12 digits)'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
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

const OwnerForm = ({ owner, onClose, isOpen }) => {
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ownerSchema),
    defaultValues: owner ? {
      nic: owner.nic,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      password: '', // Don't pre-fill password
    } : {
      nic: '',
      name: '',
      email: '',
      phone: '',
      password: '',
    }
  })

  const createMutation = useMutation({
    mutationFn: ownersAPI.createOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      showSuccess('Success', 'EV Owner created successfully')
      onClose()
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to create EV owner')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ nic, data }) => ownersAPI.updateOwner(nic, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      showSuccess('Success', 'EV Owner updated successfully')
      onClose()
      reset()
    },
    onError: (error) => {
      showError('Error', error.response?.data?.message || 'Failed to update EV owner')
    },
  })

  const onSubmit = (data) => {
    if (owner) {
      updateMutation.mutate({ nic: owner.nic, data })
    } else {
      createMutation.mutate(data)
    }
  }

  if (!isOpen) return null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="NIC"
        {...register('nic')}
        error={errors.nic?.message}
        placeholder="e.g., 123456789V or 200012345678"
        disabled={!!owner}
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
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {owner ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

export default OwnerForm
