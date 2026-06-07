import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'

const METABASE_URL = import.meta.env.REACT_APP_METABASE_URL || 'http://metabase.dev.analiza.lan'

export function Dashboard() {
  const { getIdTokenClaims } = useAuth0()
  const [metabaseToken, setMetabaseToken] = useState<string | null>(null)

  useEffect(() => {
    async function getToken() {
      try {
        const claims = await getIdTokenClaims()
        const token = claims?.['metabase/jwt']
        if (token) {
          setMetabaseToken(token)
        }
      } catch (error) {
        console.error('Error fetching Metabase token:', error)
      }
    }
    getToken()
  }, [getIdTokenClaims])

  if (!metabaseToken) {
    return <div>Loading Dashboard...</div>
  }

  return (
    <div className="h-full w-full bg-white shadow rounded-lg overflow-hidden">
      <iframe
        title="Analytics"
        src={`${METABASE_URL}/embed/dashboard/${metabaseToken}#bordered=true&titled=true`}
        frameBorder={0}
        width="100%"
        height="100%"
        className="w-full h-full"
      />
    </div>
  )
}
