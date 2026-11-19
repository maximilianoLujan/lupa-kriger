import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { ArticlesRepository } from '../../data/articles'
import { useArticleDetail } from '../../hooks/useArticleDetail'
import type { ArticleDetail, CompatibleModel, DetailArticle, Warehouse } from '../../types/article'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import { yearRange } from '../../utils/yearRange'
import { Button } from '../ui/Button'
import { ArticleCode } from './ArticleCode'
import { ArticlePhoto } from './ArticlePhoto'
import { PriceTag } from './PriceTag'
import { StockBadge } from './StockBadge'

interface ArticleDetailDialogProps {
  repository: ArticlesRepository
  /** Código del artículo a mostrar. */
  code: string
  warehouses: Warehouse[]
  /** Cambia la ficha a otro artículo (doble clic en el código de un alternativo). */
  onOpen: (code: string) => void
  onClose: () => void
}

const formatQuantity = (quantity: number) => quantity.toLocaleString('es-AR', { maximumFractionDigits: 3 })
const formatPct = (value: number) => `${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })} %`
const money = (value: number | undefined) => (value === undefined ? null : `$ ${formatPrice(value)}`)

function groupByBrand(models: CompatibleModel[]) {
  const map = new Map<string, CompatibleModel[]>()
  for (const m of models) map.set(m.brandName, [...(map.get(m.brandName) ?? []), m])
  return [...map.entries()]
}

/** Un dato de la ficha: rótulo arriba, valor abajo. Sin valor no se muestra. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  if (children === null || children === undefined || children === '') return null
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold tracking-wide text-ink-soft uppercase">{label}</dt>
      <dd className="text-sm font-semibold break-words text-ink">{children}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-3">
      <h3 className="mb-2 text-xs font-bold tracking-wide text-ink-soft uppercase">{title}</h3>
      {children}
    </section>
  )
}

function Compatibilities({ models }: { models: CompatibleModel[] }) {
  return (
    <ul className="space-y-1 text-xs">
      {groupByBrand(models).map(([brand, list]) => (
        <li key={brand}>
          <span className="font-bold text-ink">{brand}</span>{' '}
          {list.map((m, i) => {
            const years = yearRange(m)
            return (
              <span key={`${m.model}-${years ?? ''}`}>
                {i > 0 && <span className="text-line"> · </span>}
                <span className="font-medium text-ink">{m.model}</span>
                {years && <span className="ml-1 text-ink-soft">{years}</span>}
              </span>
            )
          })}
        </li>
      ))}
    </ul>
  )
}

function Stock({ article, warehouses }: { article: DetailArticle; warehouses: Warehouse[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {warehouses.map((w) => (
        <StockBadge key={w.code} warehouse={w.shortName} quantity={article.stock[w.code] ?? 0} />
      ))}
    </span>
  )
}

function locationText(article: DetailArticle, warehouses: Warehouse[]): string {
  return warehouses
    .flatMap((w) => {
      const location = article.locations?.[w.code]?.trim()
      if (!location) return []
      return [warehouses.length > 1 ? `${w.shortName} ${location}` : location]
    })
    .join(' · ')
}

function Content({
  detail,
  warehouses,
  onOpen,
}: {
  detail: ArticleDetail
  warehouses: Warehouse[]
  onOpen: (code: string) => void
}) {
  const [article, ...alternatives] = detail.alternatives
  if (!article) return <p className="text-sm text-ink-soft">El artículo no tiene datos para mostrar.</p>

  const photo = article.photoUrl ?? detail.photoUrl
  const thumb = article.photoThumbUrl ?? detail.photoThumbUrl
  const description = [...new Set([...article.details, ...detail.details])]
  const models = detail.compatibleModels

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <ArticlePhoto
          src={thumb ?? photo}
          fullSrc={photo}
          alt={article.description}
          className="h-24 w-24 shrink-0 sm:h-32 sm:w-32"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wide text-ink-soft tabular-nums">Cód. {article.particularCode}</p>
          <h2 id="article-detail-title" className="text-base leading-snug font-bold text-ink">
            {article.description}
          </h2>
          {article.brandName && <p className="mt-0.5 text-sm font-semibold text-ink-soft">{article.brandName}</p>}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Field label="Código">{article.particularCode}</Field>
        <Field label="Grupo">{detail.groupName}</Field>
        <Field label="Rubro">{article.categoryName}</Field>
        <Field label="Precio">
          <PriceTag price={article.priceList} updatedAt={article.priceUpdatedAt} />
        </Field>
        <Field label="Precio sin IVA">{money(article.priceNet)}</Field>
        <Field label="Modificación del precio">
          {article.priceUpdatedAt ? formatDate(article.priceUpdatedAt) : null}
        </Field>
        <Field label="Costo">{money(article.cost)}</Field>
        <Field label="Modificación del costo">{article.costUpdatedAt ? formatDate(article.costUpdatedAt) : null}</Field>
        <Field label="Margen sobre costo">
          {article.markupPct === undefined ? null : formatPct(article.markupPct)}
        </Field>
        <Field label="Margen sobre venta">
          {article.marginPct === undefined ? null : formatPct(article.marginPct)}
        </Field>
        <Field label="Stock">
          <Stock article={article} warehouses={warehouses} />
        </Field>
        <Field label="Stock mínimo">
          {article.reorderPoint === undefined ? null : formatQuantity(article.reorderPoint)}
        </Field>
        <Field label="Ubicación">{locationText(article, warehouses)}</Field>
        <Field label="Códigos OEM">{article.oemCodes.join(' · ')}</Field>
      </dl>

      {description.length > 0 && (
        <Section title="Descripción">
          <ul className="space-y-0.5 text-sm text-ink">
            {description.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Compatibilidades">
        {models.length > 0 ? (
          <Compatibilities models={models} />
        ) : (
          <p className="text-sm text-ink-soft">No tiene compatibilidades cargadas.</p>
        )}
      </Section>

      <Section title="Alternativos">
        {alternatives.length > 0 ? (
          <ul className="divide-y divide-line">
            {alternatives.map((a) => (
              <li key={a.particularCode} className="grid grid-cols-2 gap-x-3 gap-y-1 py-2 text-xs sm:grid-cols-[minmax(0,1.4fr)_auto_auto_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{a.brandName || a.description}</p>
                  <p className="truncate text-ink-soft">
                    <ArticleCode code={a.particularCode} onOpen={onOpen} />
                  </p>
                </div>
                <p className="text-right sm:text-left">
                  <PriceTag price={a.priceList} updatedAt={a.priceUpdatedAt} className="text-sm" />
                </p>
                <p className="text-ink-soft">
                  {a.cost !== undefined && <>Costo {money(a.cost)}</>}
                  {a.markupPct !== undefined && <> · {formatPct(a.markupPct)}</>}
                </p>
                <div className="flex justify-end">
                  <Stock article={a} warehouses={warehouses} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">No tiene alternativos.</p>
        )}
      </Section>
    </div>
  )
}

/**
 * Ficha de un artículo: lo mismo que la cajita del listado y además precio sin IVA, costo, fechas de
 * modificación, márgenes, stock mínimo, descripción, compatibilidades y alternativos. Se abre con doble clic en
 * un código y se cierra con Escape, con el botón o tocando el fondo. Va en un portal al body.
 */
export function ArticleDetailDialog({ repository, code, warehouses, onOpen, onClose }: ArticleDetailDialogProps) {
  const { detail, loading, error, retry } = useArticleDetail(repository, code)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha del artículo ${code}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-6">
        <button
          ref={closeRef}
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink ring-1 ring-line transition hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="pr-10">
          {loading && (
            <div className="flex justify-center py-10" role="status" aria-label="Cargando la ficha">
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
        </div>

        {detail && !error && <Content detail={detail} warehouses={warehouses} onOpen={onOpen} />}
      </div>
    </div>,
    document.body,
  )
}
