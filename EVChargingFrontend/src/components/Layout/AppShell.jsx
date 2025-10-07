import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Toast from '../UI/Toast'
import { useToast } from '../../hooks/useToast'

const AppShell = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            isVisible={toast.isVisible}
            onClose={() => removeToast(toast.id)}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
          />
        ))}
      </div>
    </div>
  )
}

export default AppShell
