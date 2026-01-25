import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
