import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../../api/auth'
import { useAuth } from '../../app/store.jsx'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Card from '../../components/UI/Card'
import { useToast } from '../../hooks/useToast'

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showError, showSuccess } = useToast()

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      if (data.success) {
        const { token, role, userId } = data.data
        const user = { 
          username: data.data.username || userId, 
          role, 
          nic: data.data.nic 
        }
        login(user, token)
        showSuccess('Login Successful', 'Welcome to EV Charging Management')
        navigate(from, { replace: true })
      } else {
        showError('Login Failed', data.message || 'Invalid credentials')
      }
    },
    onError: (error) => {
      showError('Login Failed', error.response?.data?.message || 'An error occurred')
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await loginMutation.mutateAsync(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            EV Charging Station Management System
          </p>
        </div>
        
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Username or NIC"
              {...register('username')}
              error={errors.username?.message}
              placeholder="Enter username or NIC"
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Enter password"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Default admin credentials: admin / Admin123!
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
