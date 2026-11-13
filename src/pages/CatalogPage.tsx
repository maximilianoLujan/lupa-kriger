import { useState } from 'react'
import { ArticleCard } from '../components/catalog/ArticleCard'
import { ListHeader } from '../components/catalog/ListHeader'
import { SearchBar } from '../components/catalog/SearchBar'
import { StockFilter } from '../components/catalog/StockFilter'
import { AppHeader } from '../components/layout/AppHeader'
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
  const [query, setQuery] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const debouncedQuery = useDebouncedValue(query)
  const warehouses = useWarehouses(repository)
  const { items, hasMore, loading, error, loadMore, retry } = useArticlesSearch(
    repository,
    debouncedQuery,
    onlyInStock,
  )

  const isEmpty = !loading && !error && items.length === 0

  return (
    <div className="min-h-dvh bg-canvas">
      {/* El filtro y los títulos de columna van dentro del header fijo: quedan a la vista al hacer scroll. */}
      <AppHeader search={<SearchBar value={query} onChange={setQuery} />}>
        <StockFilter checked={onlyInStock} onChange={setOnlyInStock} />
        {items.length > 0 && <ListHeader warehouses={warehouses} />}
      </AppHeader>

      <main className="mx-auto max-w-6xl space-y-3 px-4 py-4">
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
    </div>
  )
}
