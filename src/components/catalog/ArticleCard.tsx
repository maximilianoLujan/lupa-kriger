import type { CompatibleModel, ProductBox, Warehouse } from '../../types/article'
import { yearRange } from '../../utils/yearRange'
import { AlternativeRow } from './AlternativeRow'
import { Highlight } from './Highlight'

interface ArticleCardProps {
  box: ProductBox
  warehouses: Warehouse[]
  query: string
}

function groupByBrand(models: CompatibleModel[]) {
  const map = new Map<string, CompatibleModel[]>()
  for (const m of models) {
    const list = map.get(m.brandName) ?? []
    list.push(m)
    map.set(m.brandName, list)
  }
  return [...map.entries()]
}

/**
 * Cajita del listado: foto, descripción, modelos compatibles y equivalentes.
 * En mobile se apila; en desktop es una fila con columnas, como lupa-web.
 */
export function ArticleCard({ box, warehouses, query }: ArticleCardProps) {
  const [mainDetail, ...otherDetails] = box.details.length ? box.details : [box.description]
  const brands = groupByBrand(box.compatibleModels)

  return (
    <article className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-200 sm:p-4 lg:grid lg:grid-cols-[7rem_1fr_1fr_1.4fr] lg:gap-6">
      {/* Foto + descripción (en mobile van juntas en una fila) */}
      <div className="flex gap-3 lg:contents">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 lg:h-28 lg:w-28">
          {box.photoUrl ? (
            <img src={box.photoUrl} alt={box.description} className="h-full w-full object-contain" loading="lazy" />
          ) : (
            <PlaceholderIcon />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm leading-snug font-bold text-ink-dark">
            <Highlight text={mainDetail} query={query} />
          </h3>
          {otherDetails.map((d) => (
            <p key={d} className="text-xs leading-snug text-gray-600">
              <Highlight text={d} query={query} />
            </p>
          ))}
        </div>
      </div>

      {/* Modelos compatibles */}
      {brands.length > 0 && (
        <div className="mt-3 text-xs lg:mt-0">
          <p className="mb-1 font-semibold tracking-wide text-gray-400 uppercase lg:hidden">Modelos</p>
          <ul className="space-y-1">
            {brands.map(([brand, models]) => (
              <li key={brand}>
                <span className="font-bold text-ink">
                  <Highlight text={brand} query={query} />
                </span>{' '}
                {models.map((m, i) => {
                  const years = yearRange(m)
                  return (
                    <span key={m.model}>
                      {i > 0 && <span className="text-gray-300"> · </span>}
                      <span className="font-medium text-ink-dark">
                        <Highlight text={m.model} query={query} />
                      </span>
                      {years && <span className="ml-1 text-gray-400">{years}</span>}
                    </span>
                  )
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Equivalentes */}
      <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-100 lg:mt-0 lg:border-t-0">
        {box.alternatives.map((a) => (
          <AlternativeRow key={a.articleCode} article={a} warehouses={warehouses} query={query} />
        ))}
      </ul>
    </article>
  )
}

function PlaceholderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-gray-300"
      aria-hidden
    >
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.6-2.6 2-2z" />
    </svg>
  )
}
