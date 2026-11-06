import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { ArticleCard } from '../components/catalog/ArticleCard'
import { ListHeader } from '../components/catalog/ListHeader'
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
    <div className="min-h-dvh bg-gray-100">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <Logo className="max-w-[8.5rem] sm:max-w-[10rem]" />
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
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-3 px-4 py-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
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
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-brand" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-brand-light p-4 text-center text-sm text-brand-dark">
            <p role="alert">{error}</p>
            <Button type="button" onClick={retry} className="mt-3 h-10 w-auto px-6">
              Reintentar
            </Button>
          </div>
        )}

        {isEmpty && (
          <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-gray-200">
            <p className="font-semibold text-ink-dark">No se encontraron repuestos</p>
            <p className="mt-1 text-sm text-gray-500">Probá con otra palabra, un código o un modelo de auto.</p>
          </div>
        )}

        {hasMore && !loading && (
          <Button type="button" onClick={loadMore} className="bg-ink hover:bg-ink-dark shadow-ink/20">
            Cargar más
          </Button>
        )}
      </main>
    </div>
  )
}
