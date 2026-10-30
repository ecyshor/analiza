import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Globe, Code, Trash2, Copy, Check, AlertCircle } from 'lucide-react'
import { getDomains, createDomain, deleteDomain } from '../api'

const TRACKER_URL = import.meta.env.VITE_TRACKER_URL || import.meta.env.REACT_APP_TRACKER_URL || 'https://cdn.jsdelivr.net/gh/ecyshor/analiza@main/tracker/analiza.min.js'

// The tracker identifies the site by the tenant UUID; the domain is taken from the request Origin.
const installSnippet = (tenantId?: string) =>
  `<script defer src="${TRACKER_URL}" tenant="${tenantId ?? ''}"></script>`

export function Domains() {
  const queryClient = useQueryClient()
  const [newDomain, setNewDomain] = useState('')
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data: domains, isLoading, error: queryError } = useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const res = await getDomains()
      if (res.error) {
        throw new Error((res.error as any).message || 'Failed to fetch domains')
      }
      return res.data || []
    }
  })

  const addMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await createDomain({ body: { domain } })
      if (res.error) {
        throw new Error((res.error as any).message || 'Failed to add domain')
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] })
      setNewDomain('')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteDomain({ path: { id } })
      if (res.error) {
        throw new Error((res.error as any).message || 'Failed to delete domain')
      }
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['domains'] })
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newDomain.trim()) {
      addMutation.mutate(newDomain.trim())
    }
  }

  const handleCopy = async (domainId: string | undefined, tenantId: string | undefined) => {
    await navigator.clipboard.writeText(installSnippet(tenantId))
    setCopiedId(domainId ?? null)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const anyError = queryError || addMutation.error || deleteMutation.error

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Domains</h1>
        <p className="mt-1 text-sm text-slate-400">Websites allowed to send analytics events.</p>
      </div>

      {anyError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <p>{anyError.message}</p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="new-domain" className="mb-1.5 block text-sm font-medium text-slate-300">
              New domain
            </label>
            <input
              id="new-domain"
              type="text"
              placeholder="example.com"
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              disabled={addMutation.isPending}
            />
          </div>
          <button
            type="submit"
            disabled={addMutation.isPending || !newDomain.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {addMutation.isPending ? 'Adding...' : 'Add Domain'}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Domain</th>
                <th className="hidden px-6 py-3 text-left font-medium sm:table-cell">Status</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
                      Loading domains...
                    </div>
                  </td>
                </tr>
              ) : !domains || domains.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Globe className="h-8 w-8 text-slate-600" />
                      <p className="text-sm">No domains yet. Add your first domain above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                domains.map((domain) => (
                  <React.Fragment key={domain.id}>
                    <tr className="transition-colors hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-100">
                        <span className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-500" />
                          {domain.domain}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                          Active
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={() => setExpandedDomain(expandedDomain === domain.id ? null : (domain.id as string))}
                            className="inline-flex items-center gap-1.5 text-violet-400 transition-colors hover:text-violet-300"
                            aria-label="Install Snippet"
                          >
                            <Code className="h-4 w-4" />
                            <span className="hidden sm:inline">Install Snippet</span>
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(domain.id as string)}
                            disabled={deleteMutation.isPending}
                            className="inline-flex items-center gap-1.5 text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedDomain === domain.id && (
                      <tr className="bg-slate-950/40">
                        <td colSpan={3} className="px-6 py-4">
                          <div className="relative rounded-lg border border-white/10 bg-slate-950 p-4 font-mono text-sm text-slate-200">
                            <p className="mb-2 pr-24 text-xs uppercase tracking-wide text-slate-500">
                              Add this snippet to the &lt;head&gt; of your website
                            </p>
                            <pre className="overflow-x-auto whitespace-pre-wrap break-all"><code>{installSnippet(domain.tenant_id)}</code></pre>
                            <button
                              onClick={() => handleCopy(domain.id, domain.tenant_id)}
                              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10"
                              title="Copy to clipboard"
                              aria-label="Copy to clipboard"
                            >
                              {copiedId === domain.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
