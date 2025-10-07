type ApiError = { message?: string; error?: string; status?: number; details?: unknown }

export function getErrorMessage(e: unknown): string {
  if (!e) return "Something went wrong."
  if (typeof e === "string") return e
  if (typeof (e as any).message === "string") return (e as any).message
  if ((e as any).response?.data) {
    const d = (e as any).response.data as ApiError
    return d.message || d.error || JSON.stringify(d)
  }
  return "Network or server error."
}
