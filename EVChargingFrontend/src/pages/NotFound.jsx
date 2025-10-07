import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <HomeIcon className="h-12 w-12" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-600">Page not found</h2>
        <p className="mt-2 text-sm text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
