import { useCallback, useEffect, useState } from 'react'

// Chrome/Edge fire this before showing their own install UI; we stash the event
// so our button can trigger the prompt on demand. Safari on iOS never fires it.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'analiza-install-dismissed'

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeDismissed() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    // localStorage unavailable (private mode, blocked cookies) — session-only dismissal
  }
}

function isInstalled(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari exposes navigator.standalone instead
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  const isSafari = /^((?!chrome|android|crios|fxios|edg|opt).)*safari/i.test(ua)
  return isIOS && isSafari
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState<boolean>(() => isInstalled())
  const [dismissed, setDismissed] = useState<boolean>(() => readDismissed())
  const iosSafari = isIosSafari()

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }
    const onAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    const displayMode = window.matchMedia('(display-mode: standalone)')
    const onDisplayModeChange = () => setInstalled(isInstalled())

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    displayMode.addEventListener('change', onDisplayModeChange)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      displayMode.removeEventListener('change', onDisplayModeChange)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (choice.outcome === 'accepted') {
      setInstalled(true)
      return true
    }
    return false
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setDismissed(true)
    writeDismissed()
  }, [])

  // Installable when we have a deferred Chromium prompt or we're on iOS Safari
  // (which installs via the Share menu). Hidden once installed or dismissed.
  const canInstall = !installed && !dismissed && (deferredPrompt !== null || iosSafari)

  return {
    canInstall,
    isInstalled: installed,
    isIosSafari: iosSafari,
    hasDeferredPrompt: deferredPrompt !== null,
    promptInstall,
    dismiss,
  }
}
