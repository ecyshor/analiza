export function FullScreenLoader({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
        {message && <p className="text-sm text-slate-400">{message}</p>}
      </div>
    </div>
  )
}
