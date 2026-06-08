import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const from = location.state?.from;
      const returnTo = from ? `${from.pathname}${from.search}${from.hash}` : '/';
      loginWithRedirect({ appState: { returnTo } })
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, location])

  if (isAuthenticated) {
    const from = location.state?.from;
    const returnTo = from ? `${from.pathname}${from.search}${from.hash}` : '/';
    return <Navigate to={returnTo} replace />
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Login...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}
