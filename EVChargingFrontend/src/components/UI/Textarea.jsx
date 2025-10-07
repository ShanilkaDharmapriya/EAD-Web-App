import { forwardRef } from 'react'

const Textarea = forwardRef(({ 
  className = "", 
  variant = "default",
  ...props 
}, ref) => {
  const baseClasses = "block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
  
  const variantClasses = {
    default: "border-gray-300 text-gray-900 placeholder-gray-500",
    error: "border-red-300 text-red-900 placeholder-red-500 focus:ring-red-500",
    success: "border-green-300 text-green-900 placeholder-green-500 focus:ring-green-500"
  }

  return (
    <textarea
      ref={ref}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
