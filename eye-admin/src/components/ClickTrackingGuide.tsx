import type { ReactNode } from 'react'
import { SnippetBlock } from './SnippetBlock'

const goalSnippet = `<a href="/signup" data-analiza-click="signup">Start free trial</a>
<button data-analiza-click="newsletter">Subscribe</button>`

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-slate-300">{title}</h4>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  )
}

export function ClickTrackingGuide() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Track clicks</h3>
        <p className="mt-1 text-sm text-slate-400">
          The same snippet also tracks clicks on your links and buttons — no extra setup needed.
        </p>
      </div>

      <Section title="Tracked automatically">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300 marker:text-slate-500">
          <li>Outbound links and file downloads (pdf, zip, csv, docx, …)</li>
          <li>Email and phone links (mailto:, tel:)</li>
        </ul>
        <p className="text-sm text-slate-400">
          Privacy: only the link&apos;s <code className="rounded bg-white/10 px-1">scheme://host/path</code> is sent —
          never the query string or #fragment. Email addresses and phone numbers are never sent.
        </p>
      </Section>

      <Section title="Name your important clicks">
        <p className="text-sm text-slate-400">
          Add <code className="rounded bg-white/10 px-1">data-analiza-click=&quot;name&quot;</code> to any button, link or other
          element to record a click under that name:
        </p>
        <SnippetBlock code={goalSnippet} label="Add the attribute to any button or link" />
        <p className="text-sm text-slate-400">
          Tip: use short, stable names (lowercase, dashes), e.g.{' '}
          <code className="rounded bg-white/10 px-1">signup</code>. In site builders (Webflow, WordPress, Framer, …)
          add it as a custom attribute named <code className="rounded bg-white/10 px-1">data-analiza-click</code> on
          the element.
        </p>
      </Section>

      <Section title="Exclude a section">
        <p className="text-sm text-slate-400">
          Set <code className="rounded bg-white/10 px-1">data-analiza-click=&quot;off&quot;</code> on an element to skip click
          tracking for it and everything inside it.
        </p>
      </Section>

      <Section title="Where to see it">
        <p className="text-sm text-slate-400">
          Clicks show up in the &quot;Outbound links &amp; downloads&quot; and &quot;Click goals&quot; cards on the
          Dashboard.
        </p>
      </Section>
    </div>
  )
}
