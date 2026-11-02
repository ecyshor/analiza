import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)

// Register the service worker only in production builds (never in dev or the
// VITE_E2E_MOCK_AUTH Playwright runs), and only after the page has loaded.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').catch((error) => {
			console.warn('Service worker registration failed:', error)
		})
	})
}
