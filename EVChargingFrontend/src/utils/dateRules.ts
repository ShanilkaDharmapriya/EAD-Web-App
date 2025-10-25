import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

export const HOURS_12 = 12
export const DAYS_7 = 7

export function isWithin7Days(dt: dayjs.Dayjs) {
  const now = dayjs().utc()
  const sevenDaysFromNow = now.add(DAYS_7, "day")
  return dt.isAfter(now) && dt.isBefore(sevenDaysFromNow)
}

export function respects12HourRule(dt: dayjs.Dayjs) {
  const now = dayjs().utc()
  return dt.diff(now, "hour") >= HOURS_12
}

export function parseDateTime(dateStr: string, timeStr: string) {
  return dayjs.utc(`${dateStr}T${timeStr}`)
}

export function isWithinWorkingHours(dt: dayjs.Dayjs) {
  const hour = dt.hour()
  return hour >= 6 && hour < 22 // 6 AM to 10 PM
}
