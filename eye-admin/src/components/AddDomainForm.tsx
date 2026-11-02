import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { normalizeDomainInput, useAddDomain, validateDomain } from '../hooks/domains'

type AddDomainMutation = ReturnType<typeof useAddDomain>

interface AddDomainFormProps {
  mutation: AddDomainMutation
}

export function AddDomainForm({ mutation: addMutation }: AddDomainFormProps) {
  const [newDomain, setNewDomain] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = normalizeDomainInput(newDomain)
    const error = validateDomain(normalized)
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    addMutation.mutate(normalized, {
      onSuccess: () => {
        setNewDomain('')
      }
    })
  }

  const error = validationError || (addMutation.error ? `Couldn't add the domain: ${addMutation.error.message}` : null)

  return (
    <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-start" noValidate>
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
          onChange={(e) => {
            setNewDomain(e.target.value)
            if (validationError) setValidationError(null)
          }}
          disabled={addMutation.isPending}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'new-domain-error new-domain-hint' : 'new-domain-hint'}
        />
        <p id="new-domain-hint" className="mt-1.5 text-xs text-slate-500">
          Adding example.com also tracks www.example.com and any other subdomain.
        </p>
        {error && (
          <p id="new-domain-error" role="alert" className="mt-1.5 text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={addMutation.isPending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 disabled:opacity-50 sm:mt-7"
      >
        <Plus className="h-4 w-4" />
        {addMutation.isPending ? 'Adding…' : 'Add domain'}
      </button>
    </form>
  )
}
