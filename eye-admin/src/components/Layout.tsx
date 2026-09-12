import { useAuth0 } from '@auth0/auth0-react'
import { Link, Outlet } from 'react-router-dom'
import { LayoutDashboard, Globe, LogOut } from 'lucide-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

export function Layout() {
  const { logout, user } = useAuth0()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b flex items-center justify-center">
          <img src="/logo-with-text.png" alt="Analiza" className="h-8" />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavLink to="/domains" icon={<Globe size={20} />} label="Domains" />
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center mb-4">
            <img
              src={user?.picture}
              alt={user?.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

function NavLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
        "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <span className="mr-3 text-gray-500">{icon}</span>
      {label}
    </Link>
  )
}
