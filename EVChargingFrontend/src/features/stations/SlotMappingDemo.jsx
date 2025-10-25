import React, { useState } from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const SlotMappingDemo = () => {
  const [testResults, setTestResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const runSlotMappingTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/booking/test-slot-mapping', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setTestResults(result.data)
      } else {
        console.error('Failed to test slot mapping')
      }
    } catch (error) {
      console.error('Error testing slot mapping:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Slot Mapping Demo</h2>
              <p className="text-sm text-gray-500">
                Demonstrates how reservation times map to hour slots on the slot board
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">How Slot Mapping Works</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-700">10:30 AM</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-blue-600">10:00-11:00 AM Slot</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-700">11:15 AM</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-blue-600">11:00-12:00 PM Slot</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-700">12:45 PM</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-blue-600">12:00-1:00 PM Slot</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Any time within an hour (e.g., 10:30 AM) maps to that hour's slot (10:00-11:00 AM) 
              for display on the slot board. This ensures bookings appear in the correct time slot 
              regardless of the exact minute they were booked for.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              onClick={runSlotMappingTest}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <ClockIcon className="h-4 w-4" />
              <span>{loading ? 'Testing...' : 'Test Slot Mapping'}</span>
            </Button>
          </div>

          {testResults && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Test Results</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="space-y-2">
                  {testResults.SlotMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-gray-700">{mapping.OriginalTime}</span>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-blue-600">{mapping.SlotStartTime}</span>
                      <span className="text-gray-500">({mapping.SlotDisplay})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default SlotMappingDemo

