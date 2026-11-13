import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Domain } from '../api'
import { useAddDomain } from '../hooks/domains'
import { AddDomainForm } from './AddDomainForm'
import { InstallGuide } from './InstallGuide'
import { SnippetBlock } from './SnippetBlock'

function Step({ number, title, children, pending }: { number: number; title: string; children: ReactNode; pending?: boolean }) {
  return (
    <li className={pending ? 'opacity-60' : undefined}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-300 ring-1 ring-inset ring-violet-500/30"
        >
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </li>
  )
}

export function GettingStarted({ domains, showAddForm = true }: { domains: Domain[]; showAddForm?: boolean }) {
  const firstDomain = domains[0]
  const addMutation = useAddDomain()

  return (
    <section
      aria-labelledby="getting-started-title"
      className="rounded-xl border border-white/10 bg-slate-900/60 p-5 sm:p-6"
    >
      <h2 id="getting-started-title" className="text-lg font-semibold text-slate-100">
        Get started
      </h2>
      <p className="mt-1 text-sm text-slate-400">Three steps and your site is tracked.</p>

      <ol className="mt-6 space-y-6">
        <Step number={1} title="Add your website">
          {showAddForm ? (
            <AddDomainForm mutation={addMutation} />
          ) : (
            <p className="text-sm text-slate-400">Use the New domain form above to add your first website.</p>
          )}
        </Step>

        <Step number={2} title="Add the tracking script" pending={!firstDomain}>
          {firstDomain ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Paste the snippet into the &lt;head&gt; of {firstDomain.domain}. The snippet does nothing until the
                domain is added.
              </p>
              <SnippetBlock tenantId={firstDomain.tenant_id} />
              <InstallGuide tenantId={firstDomain.tenant_id} />
              <p className="text-sm">
                <Link
                  to="/tracking"
                  className="text-violet-400 underline-offset-2 transition-colors hover:text-violet-300 hover:underline"
                >
                  What gets tracked &amp; click goals →
                </Link>
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Your snippet appears here as soon as your first domain is saved.
            </p>
          )}
        </Step>

        <Step number={3} title="Check that it works" pending={!firstDomain}>
          <p className="text-sm text-slate-400">
            Open your site in a browser and browse a few pages. Visits show up on the Dashboard within a few minutes,
            and after adding a domain it can take up to 5 minutes before new events are accepted. Some ad and
            tracker blockers block analytics scripts, so disable them while you test.
          </p>
        </Step>
      </ol>
    </section>
  )
}
