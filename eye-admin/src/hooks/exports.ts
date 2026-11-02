import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createExportRequest, getExportRequests, type ExportRequest } from '../api'

// Same basic shape the DB enforces on api.export_requests.email.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Returns an inline error message, or null when the email is valid.
export function validateEmail(raw: string): string | null {
  const email = raw.trim()
  if (!email) return 'Enter an email address'
  if (email.length > 320) return 'That email address is too long'
  if (!EMAIL_RE.test(email)) return "That doesn't look like a valid email address — use something like you@example.com"
  return null
}

export function useExportRequests() {
  return useQuery({
    queryKey: ['export_requests'],
    queryFn: async () => {
      const res = await getExportRequests({ query: { order: 'created.desc' } })
      if (res.error) {
        throw new Error((res.error as any).message || 'Failed to fetch export requests')
      }
      return (res.data || []) as ExportRequest[]
    }
  })
}

export function useCreateExportRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await createExportRequest({ body: { email: email.trim() } })
      if (res.error) {
        throw new Error((res.error as any).message || 'Failed to request export')
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export_requests'] })
    }
  })
}
