/**
 * Hook to pre-check booking slot availability for a station.
 * Expects backend route like:
 *   GET /stations/:stationId/availability?start=ISO&end=ISO
 * If not available in API, the hook will still return "unknown" and let server validate.
 */
import { useState } from "react"
import dayjs from "dayjs"
import axios from "axios"

export type AvailabilityState = "available" | "unavailable" | "unknown"

export function useAvailability() {
  const [state, setState] = useState<AvailabilityState>("unknown")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function check(stationId: string, startISO: string, endISO: string) {
    setLoading(true); setError(null)
    try {
      const { data } = await axios.get(`/api/stations/${stationId}/availability`, { params: { start: startISO, end: endISO }})
      // Expect data: { available: boolean }
      setState(data?.available === true ? "available" : "unavailable")
    } catch (e) {
      setState("unknown")
      setError("Unable to verify availability.")
    } finally {
      setLoading(false)
    }
  }

  return { state, loading, error, check }
}
