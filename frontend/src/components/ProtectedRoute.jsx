import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondaryClr">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primaryClr/20 rounded-full" />
            <Loader2 className="w-12 h-12 text-primaryClr animate-spin absolute top-0 left-0" />
          </div>
          <p className="text-terciaryClr text-sm font-bold uppercase tracking-widest animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
