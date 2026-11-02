import { useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import clsx from 'clsx'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export function InstallAppButton({ variant = 'full' }: { variant?: 'full' | 'icon' }) {
  const { canInstall, isIosSafari, promptInstall, dismiss } = useInstallPrompt()
  const [showHelp, setShowHelp] = useState(false)

  if (!canInstall) return null

  const handleClick = async () => {
    if (isIosSafari) {
      // iOS Safari has no beforeinstallprompt — explain the Share menu flow instead.
      setShowHelp((open) => !open)
      return
    }
    const accepted = await promptInstall()
    if (!accepted) dismiss()
  }

  return (
    <div className={clsx('relative', variant === 'full' && 'flex w-full items-center gap-1')}>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label="Install app"
          title="Install app"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-violet-500/10 hover:text-violet-300"
        >
          <Download size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-violet-500/10 hover:text-violet-300"
        >
          <Download size={16} />
          Install app
        </button>
      )}

      {variant === 'full' && (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install suggestion"
          className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
        >
          <X size={14} />
        </button>
      )}

      {showHelp && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setShowHelp(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900 p-4 shadow-xl shadow-black/40">
            <div className="flex items-start gap-2.5">
              <Share size={16} className="mt-0.5 shrink-0 text-violet-400" />
              <p className="text-sm leading-relaxed text-slate-300">
                Tap the <span className="font-medium text-slate-100">Share</span> button, then{' '}
                <span className="font-medium text-slate-100">Add to Home Screen</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowHelp(false)
                dismiss()
              }}
              className="mt-3 text-xs text-slate-500 underline-offset-2 transition-colors hover:text-slate-300 hover:underline"
            >
              Don&apos;t show again
            </button>
          </div>
        </>
      )}
    </div>
  )
}
