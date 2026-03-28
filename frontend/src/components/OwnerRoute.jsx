import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function OwnerRoute({ children }) {
  const { owner } = useAuth()
  if (!owner) return <Navigate to="/login" replace />
  return children
}
