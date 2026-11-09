import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDomain, deleteDomain, getDomains, type Domain } from '../api'

export const TRACKER_URL =
  import.meta.env.VITE_TRACKER_URL ||
  import.meta.env.REACT_APP_TRACKER_URL ||
  'https://cdn.analiza.dev/analiza.js'

// The tracker reads the tenant UUID from the script tag's `tenant` attribute;
// the event's domain is taken from the request Origin on the server side.
export const installSnippet = (tenantId?: string) =>
  `<script defer src="${TRACKER_URL}" tenant="${tenantId ?? ''}"></script>`

// eye matches the event's Origin host against the registered domain and every
// parent of it, so registering "example.com" also covers "www.example.com" and
// any subdomain. A leading "www." is therefore stripped on input.
export function normalizeDomainInput(raw: string): string {
  let value = raw.trim().toLowerCase()
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, '') // scheme
  value = value.split(/[/?#]/, 1)[0] // path, query, fragment
  value = value.split(':', 1)[0] // port
  value = value.replace(/[./]+$/, '') // trailing slashes and dots
  value = value.replace(/^www\./, '')
  return value
}

const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/

// Returns an inline error message, or null when the domain is valid.
export function validateDomain(domain: string): string | null {
  if (!domain) return 'Enter a domain like example.com'
  if (domain.length > 253) return 'That domain is too long'
  if (!HOSTNAME_RE.test(domain)) return "That doesn't look like a valid domain — use something like example.com"
  const tld = domain.split('.').pop() ?? ''
  if (!/^[a-z]{2,}$/.test(tld)) return 'The domain needs an ending like .com or .dev'
  return null
}

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const res = await getDomains()
      if (res.error) {
        throw new Error((res.error as any).message || 'Failed to fetch domains')
      }
      return (res.data || []) as Domain[]
    }
  })
}

export function useAddDomain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (domain: string) => {
      const res = await createDomain({ body: { domain } })
      if (res.error) {
        throw new Error((res.error as any).message || 'Failed to add domain')
      }
      return res.data as Domain | undefined
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] })
    }
  })
}

export function useDeleteDomain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteDomain({ path: { id } })
      if (res.error) {
        throw new Error((res.error as any).message || 'Failed to delete domain')
      }
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['domains'] })
  })
}
