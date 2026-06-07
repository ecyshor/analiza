import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'

const domain = import.meta.env.VITE_AUTH0_DOMAIN || import.meta.env.REACT_APP_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || import.meta.env.REACT_APP_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || import.meta.env.REACT_APP_AUTH0_AUDIENCE

if (!domain || !clientId) {
	throw new Error('Auth0 domain and client ID not set in environment variables')
}

// Redirect after login
const onRedirectCallback = (appState: any) => {
	window.history.replaceState(
		{},
		document.title,
		appState?.returnTo || window.location.pathname
	)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Auth0Provider
			domain={domain}
			clientId={clientId}
			onRedirectCallback={onRedirectCallback}
			authorizationParams={{
				redirect_uri: `${window.location.origin}/auth-callback`,
				audience: audience,
			}}
		>
			<App />
		</Auth0Provider>
	</React.StrictMode>,
)
