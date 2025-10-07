import { forwardRef } from 'react'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'

const DateTimePicker = forwardRef(({ 
  value, 
  onChange, 
  placeholder = "Select date and time",
  minDate,
  maxDate,
  className = "",
  ...props 
}, ref) => {
  const handleChange = (e) => {
    const dateTimeValue = e.target.value
    onChange?.(dateTimeValue)
  }

  const getMinDate = () => {
    if (minDate) {
      return minDate.toISOString().slice(0, 16)
    }
    return undefined
  }

  const getMaxDate = () => {
    if (maxDate) {
      return maxDate.toISOString().slice(0, 16)
    }
    return undefined
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
      </div>
      <input
        ref={ref}
        type="datetime-local"
        value={value || ''}
        onChange={handleChange}
        min={getMinDate()}
        max={getMaxDate()}
        className={`
          block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          ${className}
        `}
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
})

DateTimePicker.displayName = 'DateTimePicker'

export default DateTimePicker
