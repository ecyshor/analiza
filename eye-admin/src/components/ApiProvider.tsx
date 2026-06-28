import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { client } from '../api/client.gen'

const POSTGREST_URL = import.meta.env.VITE_POSTGREST_URL || import.meta.env.REACT_APP_POSTGREST_URL || 'http://admin.dev.analiza.lan'

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getAccessTokenSilently } = useAuth0()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    client.setConfig({
      baseUrl: POSTGREST_URL,
    })

    client.interceptors.request.use(async (request) => {
      try {
        const token = await getAccessTokenSilently()
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      } catch (error) {
        console.error('Failed to get token for API request', error)
      }
      return request
    })

    setReady(true)
  }, [getAccessTokenSilently])

  if (!ready) {
    return null
  }

  return <>{children}</>
}
