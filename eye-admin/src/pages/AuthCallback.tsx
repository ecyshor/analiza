import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { FullScreenLoader } from '../components/FullScreenLoader'

export function AuthCallback() {
  const { error, isAuthenticated, loginWithRedirect } = useAuth0()

  useEffect(() => {
    if (error) {
      console.error('Auth callback failed', error)
    }
  }, [error])

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          <h1 className="text-lg font-semibold text-white">Sign-in failed</h1>
          <p className="max-w-md text-sm text-slate-400">{error.message}</p>
          <button
            type="button"
            onClick={() => loginWithRedirect({ appState: { returnTo: '/' } })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return <FullScreenLoader message="Authenticating..." />
}
