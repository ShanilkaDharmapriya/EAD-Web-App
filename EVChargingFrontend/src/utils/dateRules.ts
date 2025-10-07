import dayjs from "dayjs"

export const HOURS_12 = 12
export const DAYS_7 = 7

export function isWithin7Days(dt: dayjs.Dayjs) {
  const now = dayjs()
  return dt.isAfter(now) && dt.isBefore(now.add(DAYS_7, "day"))
}

export function respects12HourRule(dt: dayjs.Dayjs) {
  const now = dayjs()
  return dt.diff(now, "hour") >= HOURS_12
}

export function parseDateTime(dateStr: string, timeStr: string) {
  return dayjs(`${dateStr} ${timeStr}`)
}
