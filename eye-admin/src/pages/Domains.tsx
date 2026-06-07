import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDomains, createDomain, deleteDomain, updateDomain } from '../api'

export function Domains() {
  const queryClient = useQueryClient()
  const [newDomain, setNewDomain] = useState('')

  const { data: domains, isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => getDomains().then(res => res.data || [])
  })

  const addMutation = useMutation({
    mutationFn: (domain: string) => createDomain({ body: { domain } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] })
      setNewDomain('')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDomain({ path: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['domains'] })
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newDomain.trim()) {
      addMutation.mutate(newDomain.trim())
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
      </div>

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
                <tr key={domain.id}>
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
                      onClick={() => deleteMutation.mutate(domain.id as string)}
                      disabled={deleteMutation.isPending}
                      className="ml-4 text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
