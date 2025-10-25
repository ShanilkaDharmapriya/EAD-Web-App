import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { bookingsAPI } from '../../api/bookings'
import { useToast } from '../../hooks/useToast'
import Button from '../../components/UI/Button'

/**
 * Simple test component to verify booking functionality
 * This helps debug the booking flow without the full form complexity
 */
const BookingTestForm = () => {
  const { showSuccess, showError } = useToast()
  const [testResult, setTestResult] = useState(null)

  // Test authentication
  const debugAuthMutation = useMutation({
    mutationFn: bookingsAPI.debugAuth,
    onSuccess: (data) => {
      console.log('Auth debug result:', data)
      setTestResult({ type: 'auth', data })
      showSuccess('Auth Debug', 'Authentication info logged to console')
    },
    onError: (error) => {
      console.error('Auth debug error:', error)
      setTestResult({ type: 'auth', error: error.message })
      showError('Auth Debug Error', 'Failed to get authentication info')
    }
  })

  // Test booking creation
  const testBookingMutation = useMutation({
    mutationFn: bookingsAPI.testBooking,
    onSuccess: (data) => {
      console.log('Test booking result:', data)
      setTestResult({ type: 'booking', data })
      showSuccess('Test Booking', 'Test booking completed - check console for details')
    },
    onError: (error) => {
      console.error('Test booking error:', error)
      setTestResult({ type: 'booking', error: error.response?.data?.message || error.message })
      showError('Test Booking Error', error.response?.data?.message || 'Test booking failed')
    }
  })

  // Test real booking creation
  const createTestBooking = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0) // 10:00 AM tomorrow

    const endTime = new Date(tomorrow)
    endTime.setHours(11, 0, 0, 0) // 11:00 AM tomorrow

    const bookingData = {
      stationId: 'test-station-id', // This will likely fail, but we can see the error
      reservationDateTime: tomorrow.toISOString(),
      endDateTime: endTime.toISOString(),
    }

    console.log('Creating test booking with data:', bookingData)
    
    // Use the actual createBooking API
    bookingsAPI.createBooking(bookingData)
      .then((data) => {
        console.log('Real booking created:', data)
        setTestResult({ type: 'real-booking', data })
        showSuccess('Real Booking', 'Booking created successfully')
      })
      .catch((error) => {
        console.error('Real booking error:', error)
        setTestResult({ type: 'real-booking', error: error.response?.data?.message || error.message })
        showError('Real Booking Error', error.response?.data?.message || 'Real booking failed')
      })
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Booking Test Panel</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button
            onClick={() => debugAuthMutation.mutate()}
            disabled={debugAuthMutation.isPending}
            variant="outline"
          >
            {debugAuthMutation.isPending ? 'Testing...' : 'Test Auth'}
          </Button>
          
          <Button
            onClick={() => testBookingMutation.mutate()}
            disabled={testBookingMutation.isPending}
            variant="outline"
          >
            {testBookingMutation.isPending ? 'Testing...' : 'Test Booking'}
          </Button>
          
          <Button
            onClick={createTestBooking}
            variant="primary"
          >
            Create Real Booking
          </Button>
        </div>

        {testResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">
              Test Result ({testResult.type}):
            </h4>
            <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(testResult.data || testResult.error, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Click "Test Auth" to verify authentication is working</li>
            <li>Click "Test Booking" to test the backend booking endpoint</li>
            <li>Click "Create Real Booking" to attempt a real booking (will likely fail due to invalid station ID)</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default BookingTestForm
