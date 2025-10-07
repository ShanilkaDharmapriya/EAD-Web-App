import { Fragment, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

const Toast = ({ 
  isVisible, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }

  const colors = {
    success: 'text-success-600 bg-success-50 border-success-200',
    error: 'text-danger-600 bg-danger-50 border-danger-200',
    warning: 'text-warning-600 bg-warning-50 border-warning-200',
    info: 'text-primary-600 bg-primary-50 border-primary-200'
  }

  const Icon = icons[type]

  return (
    <Transition
      show={isVisible}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        <div className={`p-4 border-l-4 ${colors[type]}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div className="ml-3 w-0 flex-1">
              {title && (
                <p className="text-sm font-medium">{title}</p>
              )}
              {message && (
                <p className={`text-sm ${title ? 'mt-1' : ''}`}>{message}</p>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}

export default Toast
