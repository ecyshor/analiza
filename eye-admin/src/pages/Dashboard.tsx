import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

const METABASE_URL = import.meta.env.VITE_METABASE_URL || import.meta.env.REACT_APP_METABASE_URL || 'http://metabase.dev.analiza.lan'

export function Dashboard() {
  const { getIdTokenClaims } = useAuth0()
  const [metabaseToken, setMetabaseToken] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)

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

  const header = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">Traffic overview across your domains.</p>
    </div>
  )

  if (errorMsg) {
    return (
      <div className="flex h-full flex-col gap-4">
        {header}
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <p>{errorMsg}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {header}
      <div className="relative min-h-[600px] flex-1 overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
        {metabaseToken && (
          <iframe
            title="Analytics"
            src={`${METABASE_URL}/embed/dashboard/${metabaseToken}#theme=night&bordered=false&titled=false&background=false`}
            className="absolute inset-0 h-full w-full border-0"
            // Must match the embedded document's color-scheme, otherwise Chromium paints an opaque backdrop
            style={{ colorScheme: 'normal' }}
            onLoad={() => setIframeLoaded(true)}
          />
        )}
        {(!metabaseToken || !iframeLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
              <p className="text-sm text-slate-400">Loading dashboard…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
