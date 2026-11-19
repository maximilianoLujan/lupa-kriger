import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ArticlesRepository } from '../../data/articles'
import { MockArticlesRepository } from '../../data/articles/mock/MockArticlesRepository'
import { renderWithProviders as render } from '../../test/render'
import type { ArticleDetail, Warehouse } from '../../types/article'
import { formatDate } from '../../utils/formatDate'
import { ArticleDetailDialog } from './ArticleDetailDialog'

const warehouses: Warehouse[] = [{ code: 'GUA', shortName: 'GUA', name: 'Guatraché' }]
const OLD = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()

const detail: ArticleDetail = {
  articleCode: 'SKF-1',
  description: 'BOMBA DE AGUA',
  groupName: 'BOMBA DE AGUA',
  details: ['Se vende por unidad'],
  compatibleModels: [
    { brandName: 'RENAULT', model: 'MEGANE III', since: '2010' },
    { brandName: 'RENAULT', model: 'DUSTER' },
  ],
  alternatives: [
    {
      articleCode: 'SKF-1',
      particularCode: 'SKF-1',
      description: 'BOMBA AGUA RENAULT MEGANE III',
      brandCode: 'SKF',
      brandName: 'SKF',
      priceList: 121000,
      priceUpdatedAt: OLD,
      stock: { GUA: 3 },
      locations: { GUA: 'A-03-12' },
      reorderPoint: 2,
      details: ['Polea ventilada', 'Legítima'],
      categoryName: 'Refrigeración',
      compatibleModels: [{ brandName: 'RENAULT', model: 'MEGANE III', since: '2010' }],
      oemCodes: ['8200146298'],
      priceNet: 100000,
      cost: 62500,
      costUpdatedAt: '2026-09-15T09:30:00-03:00',
      markupPct: 60,
      marginPct: 37.5,
    },
    {
      articleCode: 'DOL-9',
      particularCode: 'DOL-9',
      description: 'Bomba agua Dolz',
      brandCode: 'DOL',
      brandName: 'DOLZ',
      priceList: 96800,
      stock: { GUA: 0 },
      details: [],
      compatibleModels: [],
      oemCodes: [],
      priceNet: 80000,
      cost: 50000,
      markupPct: 60,
      marginPct: 37.5,
    },
  ],
}

function repoWith(getArticle: ArticlesRepository['getArticle']): ArticlesRepository {
  return { search: vi.fn(), getArticle, getWarehouses: vi.fn(), getOrders: vi.fn(), createOrder: vi.fn() }
}

function open(repository: ArticlesRepository, code = 'SKF-1') {
  const onOpen = vi.fn()
  const onClose = vi.fn()
  render(
    <ArticleDetailDialog repository={repository} code={code} warehouses={warehouses} onOpen={onOpen} onClose={onClose} />,
  )
  return { onOpen, onClose, user: userEvent.setup() }
}

describe('ArticleDetailDialog', () => {
  it('muestra la ficha completa del artículo', async () => {
    const getArticle = vi.fn(async () => detail)
    open(repoWith(getArticle))

    const dialog = screen.getByRole('dialog', { name: 'Ficha del artículo SKF-1' })
    expect(within(dialog).getByRole('status', { name: 'Cargando la ficha' })).toBeInTheDocument()
    expect(await within(dialog).findByRole('heading', { name: 'BOMBA AGUA RENAULT MEGANE III' })).toBeInTheDocument()
    expect(getArticle).toHaveBeenCalledExactlyOnceWith('SKF-1')

    const value = (label: string) => within(dialog).getByText(label).nextElementSibling
    expect(value('Código')).toHaveTextContent('SKF-1')
    expect(value('Grupo')).toHaveTextContent('BOMBA DE AGUA')
    expect(value('Rubro')).toHaveTextContent('Refrigeración')
    expect(value('Precio')).toHaveTextContent('$ 121.000')
    expect(value('Precio sin IVA')).toHaveTextContent('$ 100.000')
    expect(value('Modificación del precio')).toHaveTextContent(formatDate(OLD))
    expect(value('Costo')).toHaveTextContent('$ 62.500')
    expect(value('Modificación del costo')).toHaveTextContent('15 sep 2026')
    expect(value('Margen sobre costo')).toHaveTextContent('60 %')
    expect(value('Margen sobre venta')).toHaveTextContent('37,5 %')
    expect(value('Stock mínimo')).toHaveTextContent('2')
    expect(value('Ubicación')).toHaveTextContent('A-03-12')
    expect(value('Códigos OEM')).toHaveTextContent('8200146298')
    expect(within(value('Stock') as HTMLElement).getByRole('img', { name: 'GUA: 3 en stock' })).toBeInTheDocument()

    // El precio viejo también va resaltado en la ficha.
    expect(within(value('Precio') as HTMLElement).getByRole('tooltip')).toHaveTextContent('Precio sin modificar hace 50 días')
    // Descripción: las líneas del artículo y las del grupo.
    expect(within(dialog).getByText('Polea ventilada')).toBeInTheDocument()
    expect(within(dialog).getByText('Se vende por unidad')).toBeInTheDocument()
    // Compatibilidades de todos los equivalentes.
    expect(within(dialog).getByText('DUSTER')).toBeInTheDocument()
    expect(within(dialog).getByText('desde 2010')).toBeInTheDocument()
  })

  it('lista los alternativos y con doble clic en su código pasa a esa ficha', async () => {
    const { onOpen, user } = open(repoWith(async () => detail))
    const dialog = screen.getByRole('dialog')
    await within(dialog).findByText('DOLZ')

    const row = within(dialog).getByText('DOLZ').closest('li') as HTMLElement
    expect(row).toHaveTextContent('$ 96.800')
    expect(row).toHaveTextContent('Costo $ 50.000 · 60 %')
    expect(within(row).getByRole('img', { name: 'GUA: sin stock' })).toBeInTheDocument()

    await user.dblClick(within(row).getByRole('button', { name: 'Ver la ficha de DOL-9' }))
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('DOL-9')
  })

  it('sin datos opcionales no muestra esos rótulos y avisa lo que falta', async () => {
    const [article] = detail.alternatives
    const bare: ArticleDetail = {
      articleCode: 'SKF-1',
      description: 'BOMBA',
      details: [],
      compatibleModels: [],
      alternatives: [
        {
          articleCode: 'SKF-1',
          particularCode: 'SKF-1',
          description: article.description,
          brandCode: '',
          brandName: '',
          priceList: 100,
          stock: {},
          details: [],
          compatibleModels: [],
          oemCodes: [],
        },
      ],
    }
    open(repoWith(async () => bare))
    const dialog = screen.getByRole('dialog')
    await within(dialog).findByRole('heading', { name: article.description })

    for (const label of ['Grupo', 'Rubro', 'Costo', 'Margen sobre costo', 'Stock mínimo', 'Ubicación', 'Códigos OEM', 'Descripción']) {
      expect(within(dialog).queryByText(label)).not.toBeInTheDocument()
    }
    expect(within(dialog).getByText('No tiene compatibilidades cargadas.')).toBeInTheDocument()
    expect(within(dialog).getByText('No tiene alternativos.')).toBeInTheDocument()
  })

  it('si falla muestra el error y reintenta', async () => {
    const getArticle = vi
      .fn<ArticlesRepository['getArticle']>()
      .mockRejectedValueOnce(new Error('No encontramos un artículo con ese código'))
      .mockResolvedValueOnce(detail)
    const { user } = open(repoWith(getArticle))

    expect(await screen.findByRole('alert')).toHaveTextContent('No encontramos un artículo con ese código')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'BOMBA AGUA RENAULT MEGANE III' })).toBeInTheDocument()
  })

  it('se cierra con el botón, con Escape y tocando el fondo, pero no tocando la ficha', async () => {
    const { onClose, user } = open(repoWith(async () => detail))
    const dialog = screen.getByRole('dialog')
    const heading = await within(dialog).findByRole('heading', { name: 'BOMBA AGUA RENAULT MEGANE III' })

    await user.click(heading)
    expect(onClose).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    await user.keyboard('{Escape}')
    await user.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('con el repositorio mock arma la ficha del código pedido', async () => {
    open(new MockArticlesRepository({ delayMs: 0 }), 'HQF-2234C')
    const dialog = screen.getByRole('dialog', { name: 'Ficha del artículo HQF-2234C' })
    await waitFor(() => expect(within(dialog).queryByRole('status')).not.toBeInTheDocument())
    expect(within(dialog).getByRole('heading', { name: 'Pastilla freno delantera Ferodo' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Ver la ficha de FR-1024' })).toBeInTheDocument()
  })
})
