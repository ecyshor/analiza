import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDomains, createDomain, deleteDomain, updateDomain } from '../api'

export function Domains() {
  const queryClient = useQueryClient()
  const [newDomain, setNewDomain] = useState('')
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)

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

  const anyError = queryError || addMutation.error || deleteMutation.error

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
      </div>

      {anyError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {anyError.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden p-6 border border-gray-200">
        <form onSubmit={handleAdd} className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="example.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            disabled={addMutation.isPending}
          />
          <button 
            type="submit" 
            disabled={addMutation.isPending || !newDomain.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {addMutation.isPending ? 'Adding...' : 'Add Domain'}
          </button>
        </form>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading domains...
                </td>
              </tr>
            ) : !domains || domains.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No domains found. Add one to get started.
                </td>
              </tr>
            ) : (
              domains.map((domain) => (
                <React.Fragment key={domain.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {domain.domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setExpandedDomain(expandedDomain === domain.id ? null : (domain.id as string))}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Install Snippet
                      </button>
                      <button 
                        onClick={() => deleteMutation.mutate(domain.id as string)}
                        disabled={deleteMutation.isPending}
                        className="ml-4 text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedDomain === domain.id && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="p-4 bg-gray-800 rounded-md shadow-inner text-gray-100 font-mono text-sm overflow-x-auto relative group">
                          <p className="text-gray-400 mb-2 text-xs uppercase tracking-wide">Add this snippet to the &lt;head&gt; of your website</p>
                          <code>
                            &lt;script defer data-domain="{domain.domain}" src="https://analiza.dev/js/script.js"&gt;&lt;/script&gt;
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(`<script defer data-domain="${domain.domain}" src="https://analiza.dev/js/script.js"></script>`)}
                            className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
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
  )
}
