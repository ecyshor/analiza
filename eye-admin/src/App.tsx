import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Domains } from './pages/Domains'
import { Login } from './pages/Login'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiProvider } from './components/ApiProvider'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth0()

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />
	}

	return <ApiProvider>{children}</ApiProvider>
}

function App() {
	const { isLoading } = useAuth0()

	if (isLoading) {
		return <div className="flex items-center justify-center h-screen">Loading application...</div>
	}

	return (
		<QueryClientProvider client={queryClient}>
			<Router>
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
					</Route>
					<Route path="/auth-callback" element={<Navigate to="/" />} />
				</Routes>
			</Router>
		</QueryClientProvider>
	)
}

export default App
