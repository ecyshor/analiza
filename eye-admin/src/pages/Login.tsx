import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { FullScreenLoader } from '../components/FullScreenLoader'

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

  return <FullScreenLoader message="Redirecting to login…" />
}
