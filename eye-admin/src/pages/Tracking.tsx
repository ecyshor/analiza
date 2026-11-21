import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { SnippetBlock } from '../components/SnippetBlock'
import { installSnippet } from '../hooks/domains'

const TRACKER_SOURCE_URL = 'https://github.com/ecyshor/analiza/blob/main/tracker/analiza.js'

// Mirrors the downloadExtension regex in tracker/analiza.js.
const DOWNLOAD_EXTENSIONS =
  'pdf, zip, gz, tar, dmg, exe, msi, pkg, deb, rpm, apk, csv, txt, doc(x), xls(x), ppt(x), odt, ods, mp3, mp4, mov, avi, epub'

const linkClass = 'text-violet-400 underline-offset-2 transition-colors hover:text-violet-300 hover:underline'
const codeClass = 'rounded bg-white/10 px-1 py-0.5 font-mono text-[0.85em] text-slate-200'

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
      <h2 id={id} className="text-lg font-semibold text-slate-100">
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  )
}

export function Tracking() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Tracking</h1>
        <p className="mt-1 text-sm text-slate-400">
          What the tracker records automatically, and how to track your own click goals.
        </p>
      </div>

      <Section id="installing" title="Installing">
        <p className="text-sm text-slate-400">
          Paste one script tag into the <code className={codeClass}>&lt;head&gt;</code> of your site, with the site id
          from <Link to="/domains" className={linkClass}>Domains</Link>:
        </p>
        <SnippetBlock code={installSnippet('YOUR-SITE-ID')} />
      </Section>

      <Section id="what-is-tracked" title="What is tracked automatically">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-slate-500">
          <li>
            <span className="font-medium text-slate-100">Page views</span> — recorded when the page loads while
            visible, on every SPA navigation (<code className={codeClass}>history.pushState</code> /{' '}
            <code className={codeClass}>popstate</code>), and again when you return to a tab that was hidden for more
            than 30 minutes or whose URL changed.
          </li>
          <li>
            <span className="font-medium text-slate-100">Page hidden (“gone”)</span> — sent when the tab is hidden;
            used to compute time on page.
          </li>
          <li>
            <span className="font-medium text-slate-100">Link clicks</span> (left and middle click) — outbound links
            and file downloads ({DOWNLOAD_EXTENSIONS}) are recorded as{' '}
            <code className={codeClass}>scheme://host/path</code>, never the query string or hash.{' '}
            <code className={codeClass}>mailto:</code> / <code className={codeClass}>tel:</code> links are recorded only
            as “mailto:” / “tel:”, never the address. Internal links are not recorded unless you name them (below).
          </li>
        </ul>
        <p className="text-sm text-slate-400">
          Every event carries only the page URL, the referrer, your site id and the event type — clicks additionally
          carry a name and a target. No cookies, no local storage, no fingerprinting.
        </p>
      </Section>

      <Section id="click-goals" title="Track your own click goals">
        <p className="text-sm text-slate-400">
          Add <code className={codeClass}>data-analiza-click=&quot;goal-name&quot;</code> to any element — buttons,
          divs, links.
          Clicks on its children count too, and the closest named ancestor wins.
        </p>
        <SnippetBlock label="A named button" code={'<button data-analiza-click="signup">Sign up</button>'} />
        <SnippetBlock
          label="A named internal link is now recorded"
          code={'<a href="/pricing" data-analiza-click="pricing-cta">See pricing</a>'}
        />
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300 marker:text-slate-500">
          <li>Use stable, lowercase-kebab-case names — they are recorded exactly as written.</li>
          <li>The name applies to the whole subtree of the element.</li>
          <li>A named outbound link records both the name and the target.</li>
        </ul>
        <p className="text-sm text-slate-500">
          In WordPress, Webflow and similar site builders, set the attribute via the element’s custom attributes
          field.
        </p>
      </Section>

      <Section id="excluding-clicks" title="Excluding clicks">
        <p className="text-sm text-slate-400">
          Set <code className={codeClass}>data-analiza-click=&quot;off&quot;</code> on an element or any ancestor to opt
          its whole subtree out — handy for a nav bar or a footer.
        </p>
        <SnippetBlock label="Nothing inside this footer is tracked" code={'<footer data-analiza-click="off">…</footer>'} />
      </Section>

      <Section id="where-to-see" title="Where to see it">
        <p className="text-sm text-slate-400">
          Page views and clicks show up in your <Link to="/" className={linkClass}>Dashboard</Link>.
        </p>
        <p className="text-sm text-slate-400">
          The full tracker source is open on{' '}
          <a
            href={TRACKER_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 ${linkClass}`}
          >
            GitHub
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          .
        </p>
      </Section>
    </div>
  )
}
