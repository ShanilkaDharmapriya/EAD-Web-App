import { cn } from '../../utils/cn'

const Card = ({ 
  children, 
  className, 
  padding = 'md',
  shadow = 'sm',
  ...props 
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg'
  }
  
  return (
    <div 
      className={cn(
        'bg-white rounded-xl border border-gray-200',
        paddings[padding],
        shadows[shadow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ children, className, ...props }) => (
  <div 
    className={cn('mb-4', className)} 
    {...props}
  >
    {children}
  </div>
)

const CardTitle = ({ children, className, ...props }) => (
  <h3 
    className={cn('text-lg font-semibold text-gray-900', className)} 
    {...props}
  >
    {children}
  </h3>
)

const CardContent = ({ children, className, ...props }) => (
  <div 
    className={cn('text-gray-600', className)} 
    {...props}
  >
    {children}
  </div>
)

const CardFooter = ({ children, className, ...props }) => (
  <div 
    className={cn('mt-4 pt-4 border-t border-gray-200', className)} 
    {...props}
  >
    {children}
  </div>
)

Card.Header = CardHeader
Card.Title = CardTitle
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
