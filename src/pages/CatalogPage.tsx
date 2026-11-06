import { useAuth } from '../auth/useAuth'
import { Logo } from '../components/Logo'

export function CatalogPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-dvh bg-gray-100">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3">
        <Logo className="max-w-[10rem]" />
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-gray-600 sm:inline">{user?.name}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-ink transition hover:border-ink"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="p-4">
        <p className="text-gray-600">Catálogo: próximamente.</p>
      </main>
    </div>
  )
}
