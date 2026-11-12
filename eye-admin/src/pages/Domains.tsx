import React, { useEffect, useState } from 'react'
import { AlertCircle, Code, Globe, Trash2 } from 'lucide-react'
import type { Domain } from '../api'
import { AddDomainForm } from '../components/AddDomainForm'
import { ClickTrackingGuide } from '../components/ClickTrackingGuide'
import { GettingStarted } from '../components/GettingStarted'
import { InstallGuide } from '../components/InstallGuide'
import { SnippetBlock } from '../components/SnippetBlock'
import { useAddDomain, useDeleteDomain, useDomains } from '../hooks/domains'

export function Domains() {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [autoExpand, setAutoExpand] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: domains, isLoading, error: queryError } = useDomains()
  const addMutation = useAddDomain()
  const deleteMutation = useDeleteDomain()

  // Auto-expand the install section of a freshly added domain. The mutation
  // result is read in the render where the add succeeded, so `variables` holds
  // the domain just added; reading it from a submit-callback closure would see
  // the pre-mutation snapshot where variables is still undefined.
  useEffect(() => {
    if (addMutation.isSuccess && addMutation.variables) {
      setAutoExpand(addMutation.variables)
      setConfirmDeleteId(null)
    }
  }, [addMutation.isSuccess, addMutation.variables])

  useEffect(() => {
    if (!autoExpand || !domains) return
    const match = domains.find((d) => d.domain === autoExpand)
    if (match?.id) {
      setExpandedDomain(match.id)
      setAutoExpand(null)
    }
  }, [autoExpand, domains])

  const handleDelete = (domain: Domain) => {
    setDeleteTarget(domain.domain ?? null)
    deleteMutation.mutate(domain.id as string, {
      onSuccess: () => setConfirmDeleteId(null)
    })
  }

  const deleteError = deleteMutation.error
    ? `Couldn't delete ${deleteTarget ?? 'the domain'}: ${deleteMutation.error.message}`
    : null

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Domains</h1>
        <p className="mt-1 text-sm text-slate-400">Add the websites you want to track.</p>
      </div>

      {(queryError || deleteError) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <p>{queryError ? `Couldn't load your domains: ${queryError.message}` : deleteError}</p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
        <AddDomainForm mutation={addMutation} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-6 py-10 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
          Loading domains…
        </div>
      ) : !domains || domains.length === 0 ? (
        <GettingStarted domains={domains ?? []} showAddForm={false} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full table-fixed">
              <thead className="bg-white/5 text-xs text-slate-400">
                <tr>
                  <th className="w-[60%] px-6 py-3 text-left font-medium sm:w-[70%]">Domain</th>
                  <th className="w-[40%] px-6 py-3 text-right font-medium sm:w-[30%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {domains.map((domain) => (
                  <React.Fragment key={domain.id}>
                    <tr className="transition-colors hover:bg-white/[0.02]">
                      <td className="max-w-0 px-6 py-4 text-sm font-medium text-slate-100">
                        <span className="flex items-center gap-2">
                          <Globe className="h-4 w-4 flex-shrink-0 text-slate-500" />
                          <span className="truncate">{domain.domain}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        {confirmDeleteId === domain.id ? (
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className="text-xs text-slate-400">
                              Delete {domain.domain}? Tracking stops immediately; stats already collected are kept.
                            </span>
                            <button
                              onClick={() => handleDelete(domain)}
                              disabled={deleteMutation.isPending}
                              className="inline-flex items-center gap-1.5 rounded-md bg-red-500/20 px-2 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-4">
                            <button
                              onClick={() =>
                                setExpandedDomain(expandedDomain === domain.id ? null : (domain.id as string))
                              }
                              className="inline-flex items-center gap-1.5 rounded text-violet-400 transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                              aria-label={`Install snippet for ${domain.domain}`}
                              aria-expanded={expandedDomain === domain.id}
                            >
                              <Code className="h-4 w-4" />
                              <span className="hidden sm:inline">Install snippet</span>
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(domain.id as string)}
                              className="inline-flex items-center gap-1.5 rounded text-red-400 transition-colors hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
                              aria-label={`Delete ${domain.domain}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedDomain === domain.id && (
                      <tr className="bg-slate-950/40">
                        <td colSpan={2} className="px-6 py-4">
                          <div className="min-w-0 max-w-full space-y-4">
                            <SnippetBlock tenantId={domain.tenant_id} />
                            <InstallGuide tenantId={domain.tenant_id} />
                            <div className="border-t border-white/10 pt-4">
                              <ClickTrackingGuide />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
