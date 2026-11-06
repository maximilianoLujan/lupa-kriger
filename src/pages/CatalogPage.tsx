import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { useCart } from '../cart/useCart'
import { ArticleCard } from '../components/catalog/ArticleCard'
import { CartDrawer } from '../components/catalog/CartDrawer'
import { ListHeader } from '../components/catalog/ListHeader'
import { NavBar } from '../components/catalog/NavBar'
import { SearchBar } from '../components/catalog/SearchBar'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { articlesRepository, type ArticlesRepository } from '../data/articles'
import { useArticlesSearch } from '../hooks/useArticlesSearch'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useWarehouses } from '../hooks/useWarehouses'

interface CatalogPageProps {
  /** Inyectable para tests. Por defecto usa el repositorio configurado por env. */
  repository?: ArticlesRepository
}

export function CatalogPage({ repository = articlesRepository }: CatalogPageProps) {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const [cartOpen, setCartOpen] = useState(false)
  const warehouses = useWarehouses(repository)
  const { items, total, hasMore, loading, error, loadMore, retry } = useArticlesSearch(
    repository,
    debouncedQuery,
  )

  const isEmpty = !loading && !error && items.length === 0

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl space-y-3 px-4 pt-3 pb-3">
          <div className="flex items-center justify-between gap-3">
            <Logo className="max-w-[8.5rem] sm:max-w-[10rem]" />
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden items-center gap-2 rounded-full bg-canvas py-1.5 pr-4 pl-1.5 text-ink ring-1 ring-line sm:flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {initials(user?.name)}
                </span>
                {user?.name}
              </span>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={count > 0 ? `Abrir carrito, ${count} unidades` : 'Abrir carrito'}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-sm shadow-brand/30 transition hover:bg-brand-hover"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                  <path d="M2 3h3l2.5 11h11L21 7H6.2" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand-text ring-2 ring-brand">
                    {count}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-canvas px-4 py-2 font-medium text-ink ring-1 ring-line transition hover:ring-brand"
              >
                Salir
              </button>
            </div>
          </div>

          <NavBar />

          <SearchBar value={query} onChange={setQuery} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-3 px-4 py-4">
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span aria-live="polite">
            {loading && items.length === 0
              ? 'Buscando…'
              : `${total} ${total === 1 ? 'resultado' : 'resultados'}`}
          </span>
        </div>

        {items.length > 0 && <ListHeader warehouses={warehouses} />}

        {items.map((box) => (
          <ArticleCard key={box.articleCode} box={box} warehouses={warehouses} query={debouncedQuery} />
        ))}

        {loading && (
          <div className="flex justify-center py-6" role="status" aria-label="Cargando">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-brand-soft p-4 text-center text-sm text-brand-text">
            <p role="alert">{error}</p>
            <Button type="button" size="sm" onClick={retry} className="mt-3">
              Reintentar
            </Button>
          </div>
        )}

        {isEmpty && (
          <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-line">
            <p className="font-semibold text-ink">No se encontraron repuestos</p>
            <p className="mt-1 text-sm text-ink-soft">Probá con otra palabra, un código o un modelo de auto.</p>
          </div>
        )}

        {hasMore && !loading && (
          <Button type="button" variant="secondary" onClick={loadMore}>
            Cargar más
          </Button>
        )}
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

function initials(name?: string) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}
