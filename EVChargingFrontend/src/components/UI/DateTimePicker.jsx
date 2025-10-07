import { forwardRef } from 'react'
import dayjs from 'dayjs'
import { cn } from '../../utils/cn'

const DateTimePicker = forwardRef(({ 
  className, 
  error = false, 
  label,
  helperText,
  value,
  onChange,
  minDate,
  maxDate,
  ...props 
}, ref) => {
  const formatValue = (val) => {
    if (!val) return ''
    return dayjs(val).format('YYYY-MM-DDTHH:mm')
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    if (newValue) {
      onChange(dayjs(newValue).toDate())
    } else {
      onChange(null)
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type="datetime-local"
        value={formatValue(value)}
        onChange={handleChange}
        min={minDate ? dayjs(minDate).format('YYYY-MM-DDTHH:mm') : undefined}
        max={maxDate ? dayjs(maxDate).format('YYYY-MM-DDTHH:mm') : undefined}
        className={cn(
          'block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm',
          error 
            ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' 
            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
})

DateTimePicker.displayName = 'DateTimePicker'

export default DateTimePicker
