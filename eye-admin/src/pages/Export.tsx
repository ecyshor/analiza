import React, { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { AlertCircle, CheckCircle2, Download, Mail } from 'lucide-react'
import type { ExportRequest } from '../api'
import { useCreateExportRequest, useExportRequests, validateEmail } from '../hooks/exports'

function formatDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function requestStatus(request: ExportRequest): string {
  return request.notified_at ? 'Processing' : 'Pending'
}

export function Export() {
  const { user } = useAuth0()
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [requested, setRequested] = useState(false)

  const { data: requests, isLoading, error: queryError } = useExportRequests()
  const createMutation = useCreateExportRequest()

  // Prefill the email input with the signed-in user's address when available.
  useEffect(() => {
    if (user?.email) setEmail((current) => current || user.email || '')
  }, [user?.email])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const error = validateEmail(email)
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    setRequested(false)
    createMutation.mutate(email, {
      onSuccess: () => setRequested(true)
    })
  }

  const formError = validationError || (createMutation.error ? `Couldn't request the export: ${createMutation.error.message}` : null)

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Export</h1>
        <p className="mt-1 text-sm text-slate-400">
          Request an export of your analytics data. We’ll email it to the address below once it’s ready.
        </p>
      </div>

      {queryError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <p>Couldn’t load your export requests: {queryError.message}</p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start" noValidate>
          <div className="flex-1">
            <label htmlFor="export-email" className="mb-1.5 block text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              id="export-email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (validationError) setValidationError(null)
                if (requested) setRequested(false)
              }}
              disabled={createMutation.isPending}
              aria-invalid={formError ? true : undefined}
              aria-describedby={formError ? 'export-email-error' : undefined}
            />
            {formError && (
              <p id="export-email-error" role="alert" className="mt-1.5 text-xs text-red-400">
                {formError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 disabled:opacity-50 sm:mt-7"
          >
            <Download className="h-4 w-4" />
            {createMutation.isPending ? 'Requesting…' : 'Request export'}
          </button>
        </form>
        {requested && !createMutation.error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            <p>Export requested. We’ll email your data to {email.trim()} once it’s ready.</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-6 py-10 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
          Loading export requests…
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-500">
          No export requests yet. Use the form above to request one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full table-fixed">
              <thead className="bg-white/5 text-xs text-slate-400">
                <tr>
                  <th className="w-[45%] px-6 py-3 text-left font-medium">Email</th>
                  <th className="w-[35%] px-6 py-3 text-left font-medium">Requested</th>
                  <th className="w-[20%] px-6 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map((request) => (
                  <tr key={request.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="max-w-0 px-6 py-4 text-sm font-medium text-slate-100">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4 flex-shrink-0 text-slate-500" />
                        <span className="truncate">{request.email}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(request.created)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={
                          request.notified_at
                            ? 'inline-flex rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-300'
                            : 'inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300'
                        }
                      >
                        {requestStatus(request)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
