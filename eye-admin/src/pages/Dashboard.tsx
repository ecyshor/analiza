import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'

const METABASE_URL = import.meta.env.REACT_APP_METABASE_URL || 'http://metabase.dev.analiza.lan'

export function Dashboard() {
  const { getIdTokenClaims } = useAuth0()
  const [metabaseToken, setMetabaseToken] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function getToken() {
      try {
        const claims = await getIdTokenClaims()
        const token = claims?.['metabase/jwt']
        if (token) {
          setMetabaseToken(token)
        } else {
          setErrorMsg('Metabase token not found in claims')
        }
      } catch (error: any) {
        console.error('Error fetching Metabase token:', error)
        setErrorMsg(error.message || 'Error fetching Metabase token')
      }
    }
    getToken()
  }, [getIdTokenClaims])

  if (errorMsg) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-4xl">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {errorMsg}
            </p>
          </div>
        </div>
      </div>
    )
  }

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
