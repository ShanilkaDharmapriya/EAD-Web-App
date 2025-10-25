import React, { useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Component to test timezone handling and verify the fix
 */
const TimezoneTest = () => {
  const [testDate, setTestDate] = useState('2024-01-15')
  const [testTime, setTestTime] = useState('10:00')
  const [result, setResult] = useState(null)

  const testTimezoneConversion = () => {
    // Simulate the same logic as the booking form
    const localStartDate = dayjs(`${testDate}T${testTime}`)
    const localEndDate = dayjs(`${testDate}T${testTime}`).add(1, 'hour')
    
    const startDate = localStartDate.utc()
    const endDate = localEndDate.utc()
    
    const bookingData = {
      stationId: 'test-station',
      reservationDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
    }

    setResult({
      input: {
        date: testDate,
        time: testTime,
        localStart: localStartDate.format('YYYY-MM-DD HH:mm:ss'),
        localEnd: localEndDate.format('YYYY-MM-DD HH:mm:ss'),
      },
      output: {
        utcStart: startDate.toISOString(),
        utcEnd: endDate.toISOString(),
        bookingData,
      },
      timezone: {
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        utcOffset: dayjs().utcOffset(),
      }
    })
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Timezone Conversion Test</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Test Date</label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Test Time</label>
            <input
              type="time"
              value={testTime}
              onChange={(e) => setTestTime(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <button
          onClick={testTimezoneConversion}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Timezone Conversion
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Conversion Result:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Input:</strong> {result.input.date} at {result.input.time}
              </div>
              <div>
                <strong>Local Start:</strong> {result.input.localStart}
              </div>
              <div>
                <strong>Local End:</strong> {result.input.localEnd}
              </div>
              <div>
                <strong>UTC Start:</strong> {result.output.utcStart}
              </div>
              <div>
                <strong>UTC End:</strong> {result.output.utcEnd}
              </div>
              <div>
                <strong>User Timezone:</strong> {result.timezone.userTimezone}
              </div>
              <div>
                <strong>UTC Offset:</strong> {result.timezone.utcOffset} minutes
              </div>
            </div>
            
            <div className="mt-4">
              <strong>Booking Data:</strong>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(result.output.bookingData, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Select a date and time (e.g., 10:00 AM)</li>
            <li>Click "Test Timezone Conversion"</li>
            <li>Check that the UTC times are correct</li>
            <li>Verify that 10:00 AM local time converts to the correct UTC time</li>
            <li>This should match what gets sent to the backend</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default TimezoneTest
