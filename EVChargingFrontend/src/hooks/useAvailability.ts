/**
 * Hook to pre-check booking slot availability for a station.
 * Uses the backend availability endpoint: GET /api/booking/availability/:stationId?date=YYYY-MM-DD
 */
import { useState } from "react"
import dayjs from "dayjs"
import { bookingsAPI } from "../api/bookings"

export type AvailabilityState = "available" | "unavailable" | "unknown"

export function useAvailability() {
  const [state, setState] = useState<AvailabilityState>("unknown")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function check(stationId: string, startISO: string, endISO: string) {
    setLoading(true)
    setError(null)
    try {
      // Extract date from startISO for the availability check
      const date = dayjs(startISO).format('YYYY-MM-DD')
      
      // Get available slots for the station on this date
      const response = await bookingsAPI.getAvailableSlots(stationId, date)
      
      if (response.success && response.data?.timeSlots) {
        const timeSlots = response.data.timeSlots
        
        // Check if our requested time slot is available
        const startTime = dayjs(startISO).format('HH:mm')
        const endTime = dayjs(endISO).format('HH:mm')
        
        // Find slots that overlap with our requested time
        const overlappingSlots = timeSlots.filter(slot => {
          const slotStart = slot.time
          const slotEnd = dayjs(`${date}T${slotStart}`).add(1, 'hour').format('HH:mm')
          
          // Check if our requested time overlaps with this slot
          return (startTime >= slotStart && startTime < slotEnd) || 
                 (endTime > slotStart && endTime <= slotEnd) ||
                 (startTime <= slotStart && endTime >= slotEnd)
        })
        
        // If any overlapping slot is unavailable, mark as unavailable
        const hasUnavailableSlot = overlappingSlots.some(slot => !slot.available)
        setState(hasUnavailableSlot ? "unavailable" : "available")
      } else {
        setState("unknown")
        setError("Unable to verify availability.")
      }
    } catch (e) {
      console.error('Availability check error:', e)
      setState("unknown")
      setError("Unable to verify availability.")
    } finally {
      setLoading(false)
    }
  }

  return { state, loading, error, check }
}
