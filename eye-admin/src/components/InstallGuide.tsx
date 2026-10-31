import { useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import clsx from 'clsx'
import { SnippetBlock } from './SnippetBlock'
import { TRACKER_URL } from '../hooks/domains'

type Platform = {
  id: string
  name: string
  steps: ReactNode[]
  // When set, this code is shown instead of the plain script snippet.
  code?: string
}

const nextjsSnippet = (tenantId?: string) => `import Script from 'next/script'

<Script
  src="${TRACKER_URL}"
  strategy="afterInteractive"
  tenant="${tenantId ?? ''}"
/>`

// GTM strips custom attributes from a literal <script> tag inside a Custom
// HTML tag, so the tenant attribute would be lost. Creating the element in JS
// keeps it: document.currentScript inside the tracker then has the attribute.
const gtmSnippet = (tenantId?: string) => `<script>
  var s = document.createElement('script');
  s.defer = true;
  s.src = '${TRACKER_URL}';
  s.setAttribute('tenant', '${tenantId ?? ''}');
  document.head.appendChild(s);
</script>`

export function InstallGuide({ tenantId }: { tenantId?: string }) {
  const platforms: Platform[] = [
    {
      id: 'html',
      name: 'HTML site',
      steps: [
        'Copy the snippet above.',
        <>Paste it inside the <code className="rounded bg-white/10 px-1">&lt;head&gt;</code> of your pages, before the closing <code className="rounded bg-white/10 px-1">&lt;/head&gt;</code> tag.</>,
        'Reload your site — visits show up on the dashboard within a few minutes.'
      ]
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      steps: [
        "Install the WPCode plugin (the \"Insert Headers and Footers\" plugin also works).",
        'Add a new snippet, paste the snippet above and set the location to Header.',
        'Make the snippet load on all pages, then save and activate it.',
        'Or edit your theme directly: Appearance → Theme file editor → header.php, and paste the snippet before </head>.'
      ]
    },
    {
      id: 'shopify',
      name: 'Shopify',
      steps: [
        'Go to Online Store → Themes, click … on your current theme and choose Edit code.',
        'Open layout/theme.liquid.',
        'Paste the snippet just before the closing </head> tag, then save.'
      ]
    },
    {
      id: 'wix',
      name: 'Wix',
      steps: [
        'Go to Settings → Custom code.',
        'Click Add custom code, paste the snippet and choose Head as the place to add it.',
        'Apply the code to all pages, then publish your site.',
        'Note: custom code needs a premium plan with a connected domain.'
      ]
    },
    {
      id: 'squarespace',
      name: 'Squarespace',
      steps: [
        'Go to Settings → Developer tools → Code injection (older sites: Settings → Advanced → Code injection).',
        'Paste the snippet above into the Header field and save.',
        'Note: code injection is not available on the Personal plan.'
      ]
    },
    {
      id: 'webflow',
      name: 'Webflow',
      steps: [
        "Open your site's settings and go to the Custom code tab.",
        'Paste the snippet into the Head code field and save.',
        'Publish your site for the change to go live. Note: custom code needs a paid site plan.'
      ]
    },
    {
      id: 'ghost',
      name: 'Ghost',
      steps: [
        'Go to Settings → Code injection.',
        'Paste the snippet into the Site header field and save.'
      ]
    },
    {
      id: 'framer',
      name: 'Framer',
      steps: [
        'Open Site settings → General → Custom code.',
        'Paste the snippet under End of <head> and save.',
        'Publish your site for the change to go live.'
      ]
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      steps: [
        'In your root layout (app/layout.tsx), add the code below with next/script.',
        'The tracker follows pushState and popstate, so client-side navigation between pages is tracked automatically.'
      ],
      code: nextjsSnippet(tenantId)
    },
    {
      id: 'gtm',
      name: 'Google Tag Manager',
      steps: [
        'Create a Custom HTML tag with an All Pages trigger.',
        'Paste the loader below into the tag. It adds the script with the tenant attribute, which a plain script tag in GTM would lose.',
        'Save the tag and publish your container.'
      ],
      code: gtmSnippet(tenantId)
    }
  ]

  const [active, setActive] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const baseId = useId().replace(/[^a-zA-Z0-9]/g, '')

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (active + 1) % platforms.length
    else if (e.key === 'ArrowLeft') next = (active - 1 + platforms.length) % platforms.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = platforms.length - 1
    if (next !== null) {
      e.preventDefault()
      setActive(next)
      tabRefs.current[next]?.focus()
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Choose your platform"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2"
      >
        {platforms.map((platform, i) => (
          <button
            key={platform.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={clsx(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60',
              active === i
                ? 'border-violet-500/50 bg-violet-500/15 text-violet-200'
                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            )}
          >
            {platform.name}
          </button>
        ))}
      </div>
      {platforms.map((platform, i) => (
        <div
          key={platform.id}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={active !== i}
          className="mt-4 space-y-4"
        >
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300 marker:text-slate-500">
            {platform.steps.map((step, j) => (
              <li key={j}>{step}</li>
            ))}
          </ol>
          {/* Only platforms whose code differs from the snippet above get their own block. */}
          {platform.code && <SnippetBlock tenantId={tenantId} code={platform.code} />}
        </div>
      ))}
    </div>
  )
}
