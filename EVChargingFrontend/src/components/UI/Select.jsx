import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Select = forwardRef(({ 
  className, 
  error = false, 
  label,
  helperText,
  options = [],
  placeholder = 'Select an option',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm',
          error 
            ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' 
            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
