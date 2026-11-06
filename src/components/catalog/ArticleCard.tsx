import type { CompatibleModel, ProductBox, Warehouse } from '../../types/article'
import { yearRange } from '../../utils/yearRange'
import { AlternativeRow } from './AlternativeRow'
import { ArticlePhoto } from './ArticlePhoto'
import { CARD_GRID } from './columns'
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
    <article className={`rounded-2xl bg-white p-3 shadow-sm shadow-lilac ring-1 ring-line sm:p-4 ${CARD_GRID}`}>
      {/* Foto + descripción (en mobile van juntas en una fila) */}
      <div className="flex gap-3 lg:contents">
        <ArticlePhoto src={box.photoUrl} alt={box.description} className="h-20 w-20 shrink-0 lg:h-28 lg:w-28" />

        <div className="min-w-0 flex-1">
          <h3 className="text-sm leading-snug font-bold text-ink">
            <Highlight text={mainDetail} query={query} />
          </h3>
          {otherDetails.map((d) => (
            <p key={d} className="text-xs leading-snug text-ink-soft">
              <Highlight text={d} query={query} />
            </p>
          ))}
        </div>
      </div>

      {/* Modelos compatibles */}
      {brands.length > 0 && (
        <div className="mt-3 text-xs lg:mt-0">
          <p className="mb-1 font-semibold tracking-wide text-ink-soft uppercase lg:hidden">Modelos</p>
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
                      {i > 0 && <span className="text-line"> · </span>}
                      <span className="font-medium text-ink">
                        <Highlight text={m.model} query={query} />
                      </span>
                      {years && <span className="ml-1 text-ink-soft">{years}</span>}
                    </span>
                  )
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Equivalentes */}
      <ul className="mt-3 divide-y divide-line border-t border-line lg:mt-0 lg:border-t-0">
        {box.alternatives.map((a) => (
          <AlternativeRow key={a.articleCode} article={a} warehouses={warehouses} query={query} />
        ))}
      </ul>
    </article>
  )
}
