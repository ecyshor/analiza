import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { installSnippet } from '../hooks/domains'

export function SnippetBlock({ tenantId, code }: { tenantId?: string; code?: string }) {
  const [copied, setCopied] = useState(false)
  const snippet = code ?? installSnippet(tenantId)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative min-w-0 max-w-full rounded-lg border border-white/10 bg-slate-950 p-4 font-mono text-sm text-slate-200">
      <p className="mb-2 pr-24 text-xs text-slate-500">Paste this snippet into the &lt;head&gt; of your website</p>
      <pre className="max-w-full overflow-x-auto whitespace-pre"><code>{snippet}</code></pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
      >
        {copied ? (
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
  )
}
