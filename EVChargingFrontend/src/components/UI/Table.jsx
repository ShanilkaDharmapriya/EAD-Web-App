import { cn } from '../../utils/cn'

const Table = ({ children, className, ...props }) => (
  <div className="overflow-x-auto">
    <table 
      className={cn('min-w-full divide-y divide-gray-200', className)} 
      {...props}
    >
      {children}
    </table>
  </div>
)

const TableHeader = ({ children, className, ...props }) => (
  <thead 
    className={cn('bg-gray-50', className)} 
    {...props}
  >
    {children}
  </thead>
)

const TableBody = ({ children, className, ...props }) => (
  <tbody 
    className={cn('bg-white divide-y divide-gray-200', className)} 
    {...props}
  >
    {children}
  </tbody>
)

const TableRow = ({ children, className, hover = true, ...props }) => (
  <tr 
    className={cn(
      hover && 'hover:bg-gray-50',
      className
    )} 
    {...props}
  >
    {children}
  </tr>
)

const TableHead = ({ children, className, ...props }) => (
  <th 
    className={cn(
      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      className
    )} 
    {...props}
  >
    {children}
  </th>
)

const TableCell = ({ children, className, ...props }) => (
  <td 
    className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)} 
    {...props}
  >
    {children}
  </td>
)

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) => (
  <div className="text-center py-12">
    {Icon && (
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
    )}
    <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
    {description && (
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    )}
    {action && (
      <div className="mt-6">
        {action}
      </div>
    )}
  </div>
)

Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Head = TableHead
Table.Cell = TableCell
Table.EmptyState = EmptyState

export default Table
