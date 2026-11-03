import { useAuth0 } from '@auth0/auth0-react'
import { Outlet, NavLink as RouterNavLink } from 'react-router-dom'
import { LayoutDashboard, Globe, Download, LogOut } from 'lucide-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { InstallAppButton } from './InstallAppButton'

export function Layout() {
  const { logout, user } = useAuth0()

  const navItems = (
    <>
      <SidebarLink to="/" end icon={<LayoutDashboard size={18} />} label="Dashboard" />
      <SidebarLink to="/domains" icon={<Globe size={18} />} label="Domains" />
      <SidebarLink to="/export" icon={<Download size={18} />} label="Export" />
    </>
  )

  return (
    <div className="flex h-screen flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* Sidebar (md and up) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-slate-900/40">
        <div className="flex h-16 items-center px-5 border-b border-white/10">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3">
            <InstallAppButton />
          </div>
          <div className="mb-3 flex items-center gap-3">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-9 w-9 rounded-full ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300 ring-1 ring-white/10">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-100">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar (padded for the notch when installed with a translucent status bar) */}
      <div className="flex min-h-14 shrink-0 items-center justify-between gap-2 px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 border-b border-white/10 bg-slate-900/40 md:hidden">
        <Logo className="shrink-0" />
        <div className="flex min-w-0 items-center gap-1">
          <MobileNavLink to="/" end icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <MobileNavLink to="/domains" icon={<Globe size={16} />} label="Domains" />
          <MobileNavLink to="/export" icon={<Download size={16} />} label="Export" />
          <InstallAppButton variant="icon" />
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            aria-label="Sign out"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function SidebarLink({ to, icon, label, end }: { to: string; icon: ReactNode; label: string; end?: boolean }) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-violet-500/10 text-white before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-violet-500 before:content-[""]'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={clsx('flex-shrink-0', isActive ? 'text-violet-400' : 'text-slate-500')}>
            {icon}
          </span>
          {label}
        </>
      )}
    </RouterNavLink>
  )
}

function MobileNavLink({ to, icon, label, end }: { to: string; icon: ReactNode; label: string; end?: boolean }) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      aria-label={label}
      title={label}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-1.5 rounded-lg p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium transition-colors',
          isActive
            ? 'bg-violet-500/10 text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-violet-400' : 'text-slate-500'}>{icon}</span>
          {/* Icon-only on phones: logo + three labels + actions overflow a 390px viewport */}
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </RouterNavLink>
  )
}
