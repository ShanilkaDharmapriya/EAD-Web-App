import { Navigate } from 'react-router-dom'
import { useAuth } from '../../app/store.jsx'

const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RoleGuard
