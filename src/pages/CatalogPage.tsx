import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { ArticleCard } from '../components/catalog/ArticleCard'
import { ListHeader } from '../components/catalog/ListHeader'
import { NavBar } from '../components/catalog/NavBar'
import { SearchBar } from '../components/catalog/SearchBar'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { articlesRepository, type ArticlesRepository } from '../data/articles'
import { useArticlesSearch } from '../hooks/useArticlesSearch'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { Warehouse } from '../types/article'

interface CatalogPageProps {
  /** Inyectable para tests. Por defecto usa el repositorio configurado por env. */
  repository?: ArticlesRepository
}

export function CatalogPage({ repository = articlesRepository }: CatalogPageProps) {
  const { user, logout } = useAuth()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const { items, total, hasMore, loading, error, loadMore, retry } = useArticlesSearch(
    repository,
    debouncedQuery,
  )

  useEffect(() => {
    let cancelled = false
    repository.getWarehouses().then((w) => {
      if (!cancelled) setWarehouses(w)
    })
    return () => {
      cancelled = true
    }
  }, [repository])

  const isEmpty = !loading && !error && items.length === 0

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-gradient-to-r from-brand-soft via-white to-sky">
        <div className="mx-auto max-w-6xl space-y-3 px-4 pt-3 pb-3">
          <div className="flex items-center justify-between gap-4">
            <Logo className="max-w-[8.5rem] sm:max-w-[10rem]" />
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden items-center gap-2 rounded-full bg-white/80 py-1.5 pr-4 pl-1.5 text-ink ring-1 ring-line sm:flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-text">
                  {initials(user?.name)}
                </span>
                {user?.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white/80 px-4 py-1.5 font-medium text-ink ring-1 ring-line transition hover:bg-white hover:ring-brand"
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
            <Button type="button" onClick={retry} className="mt-3 h-10 w-auto px-6">
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
          <Button type="button" onClick={loadMore} className="bg-sky shadow-sky hover:bg-lilac">
            Cargar más
          </Button>
        )}
      </main>
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
