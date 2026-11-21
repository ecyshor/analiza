import type { ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Domains } from './pages/Domains'
import { Tracking } from './pages/Tracking'
import { Export } from './pages/Export'
import { Login } from './pages/Login'
import { AuthCallback } from './pages/AuthCallback'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiProvider } from './components/ApiProvider'
import { FullScreenLoader } from './components/FullScreenLoader'

const queryClient = new QueryClient()

const domain = import.meta.env.VITE_AUTH0_DOMAIN || import.meta.env.REACT_APP_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || import.meta.env.REACT_APP_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || import.meta.env.REACT_APP_AUTH0_AUDIENCE

if (!domain || !clientId) {
	throw new Error('Auth0 domain and client ID not set in environment variables')
}

function Auth0ProviderWithNavigate({ children }: { children: ReactNode }) {
	const navigate = useNavigate()

	const onRedirectCallback = (appState: any) => {
		navigate(appState?.returnTo || window.location.pathname, { replace: true })
	}

	return (
		<Auth0Provider
			domain={domain}
			clientId={clientId}
			onRedirectCallback={onRedirectCallback}
			cacheLocation="localstorage"
			authorizationParams={{
				redirect_uri: `${window.location.origin}/auth-callback`,
				audience: audience,
			}}
		>
			{children}
		</Auth0Provider>
	)
}

function ProtectedRoute({ children }: { children: ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth0()
	const location = useLocation()

	if (isLoading) {
		return <FullScreenLoader message="Loading..." />
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	return <ApiProvider>{children}</ApiProvider>
}

function AppRoutes() {
	const { isLoading } = useAuth0()

	if (isLoading) {
		return <FullScreenLoader message="Loading application..." />
	}

	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}
			>
				<Route index element={<Dashboard />} />
				<Route path="domains" element={<Domains />} />
				<Route path="tracking" element={<Tracking />} />
				<Route path="export" element={<Export />} />
			</Route>
			<Route path="/auth-callback" element={<AuthCallback />} />
		</Routes>
	)
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Router>
				<Auth0ProviderWithNavigate>
					<AppRoutes />
				</Auth0ProviderWithNavigate>
			</Router>
		</QueryClientProvider>
	)
}

export default App
