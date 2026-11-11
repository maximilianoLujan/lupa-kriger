import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import logo from '../../assets/logo.jpg'
import type { ProductBox, Warehouse } from '../../types/article'
import { yearRange } from '../../utils/yearRange'
import { renderWithProviders as render } from '../../test/render'
import { ArticleCard } from './ArticleCard'

const warehouses: Warehouse[] = [
  { code: 'GUA', shortName: 'GUA', name: 'Guatraché' },
  { code: 'DEP', shortName: 'DEP', name: 'Depósito' },
]

const box: ProductBox = {
  articleCode: '1',
  description: 'PASTILLA DE FRENO',
  details: ['PASTILLA DE FRENO', 'JUEGO X4'],
  compatibleModels: [
    { brandName: 'VOLKSWAGEN', model: 'GOL', since: '2008', until: '2023' },
    { brandName: 'VOLKSWAGEN', model: 'FOX', since: '2004' },
    { brandName: 'FIAT', model: 'UNO', until: '2010' },
  ],
  alternatives: [
    { articleCode: '1-1', particularCode: 'FR-1024', description: 'PASTILLA DE FRENO FR-1024', brandCode: 'FRR', brandName: 'FRIC-ROT', priceList: 28900, stock: { GUA: 12, DEP: 0 } },
    { articleCode: '1-2', particularCode: 'N-1037', description: 'Cobreq', brandCode: 'COB', brandName: 'COBREQ', priceList: 22100, stock: { GUA: 0 }, isOutlet: true },
  ],
}

describe('ArticleCard', () => {
  it('muestra código y descripción, sin las líneas de detalle', () => {
    render(<ArticleCard box={box} warehouses={warehouses} query="" />)
    expect(screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === 'Cód. 1')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'PASTILLA DE FRENO' })).toBeInTheDocument()
    expect(screen.queryByText('JUEGO X4')).not.toBeInTheDocument()
  })

  it('resalta el código del artículo cuando se busca por código', () => {
    render(<ArticleCard box={{ ...box, articleCode: '10001' }} warehouses={warehouses} query="10001" />)
    const marks = screen.getAllByText((_, el) => el?.tagName === 'MARK').map((m) => m.textContent)
    expect(marks).toContain('10001')
  })

  it('agrupa modelos por marca y muestra años', () => {
    render(<ArticleCard box={box} warehouses={warehouses} query="" />)
    expect(screen.getByText('VOLKSWAGEN')).toBeInTheDocument()
    expect(screen.getByText('GOL')).toBeInTheDocument()
    expect(screen.getByText('2008/2023')).toBeInTheDocument()
    expect(screen.getByText('desde 2004')).toBeInTheDocument()
    expect(screen.getByText('hasta 2010')).toBeInTheDocument()
  })

  it('lista los equivalentes con marca, código, precio y stock por sucursal', () => {
    render(<ArticleCard box={box} warehouses={warehouses} query="" />)
    const rows = screen.getAllByRole('listitem').filter((li) => within(li).queryByText(/\$/))
    expect(rows).toHaveLength(2)

    const first = rows[0]
    expect(within(first).getByText('FRIC-ROT')).toBeInTheDocument()
    expect(within(first).getByText('FR-1024')).toBeInTheDocument()
    expect(within(first).getByText('$ 28.900')).toBeInTheDocument()
    expect(within(first).getByRole('img', { name: 'GUA: 12 en stock' })).toBeInTheDocument()
    expect(within(first).getByRole('img', { name: 'DEP: sin stock' })).toBeInTheDocument()
  })

  it('una sucursal sin dato se muestra sin stock', () => {
    render(<ArticleCard box={box} warehouses={warehouses} query="" />)
    const outletRow = screen.getByText('COBREQ').closest('li')!
    expect(within(outletRow).getByRole('img', { name: 'DEP: sin stock' })).toBeInTheDocument()
  })

  it('marca los artículos outlet', () => {
    render(<ArticleCard box={box} warehouses={warehouses} query="" />)
    expect(screen.getByText('Outlet')).toBeInTheDocument()
  })

  it('resalta la query en descripción, modelos y marcas', () => {
    render(<ArticleCard box={box} warehouses={warehouses} query="freno gol cobreq" />)
    const marks = screen.getAllByText((_, el) => el?.tagName === 'MARK').map((m) => m.textContent)
    expect(marks).toEqual(expect.arrayContaining(['FRENO', 'GOL', 'COBREQ']))
  })

  it('muestra la foto cuando hay URL y el logo cuando no', () => {
    const { rerender } = render(<ArticleCard box={box} warehouses={warehouses} query="" />)
    expect(screen.getByRole('img', { name: 'PASTILLA DE FRENO' })).toHaveAttribute('src', logo)

    rerender(<ArticleCard box={{ ...box, photoUrl: '/foto.jpg' }} warehouses={warehouses} query="" />)
    expect(screen.getByRole('img', { name: 'PASTILLA DE FRENO' })).toHaveAttribute('src', '/foto.jpg')
  })

  it('la card usa la miniatura y el visor abre la foto completa', async () => {
    const user = userEvent.setup()
    render(
      <ArticleCard
        box={{ ...box, photoUrl: '/grande.jpg', photoThumbUrl: '/thumb.jpg' }}
        warehouses={warehouses}
        query=""
      />,
    )
    expect(screen.getByRole('img', { name: 'PASTILLA DE FRENO' })).toHaveAttribute('src', '/thumb.jpg')

    await user.click(screen.getByRole('button', { name: /ver foto de pastilla de freno en grande/i }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('img', { name: 'PASTILLA DE FRENO' })).toHaveAttribute('src', '/grande.jpg')
  })

  it('el título es la descripción del primer equivalente con stock, sin su código', () => {
    const [fricRot, cobreq] = box.alternatives
    render(
      <ArticleCard
        box={{
          ...box,
          description: '5404',
          details: ['API GL-5', 'Grupo alternativo 5404'],
          alternatives: [
            { ...fricRot, description: 'PASTILLA SIN STOCK', stock: { GUA: 0 } },
            { ...cobreq, description: 'N-1037 - PASTILLA COBREQ', stock: { DEP: 3 } },
          ],
        }}
        warehouses={warehouses}
        query=""
      />,
    )
    expect(screen.getByRole('heading', { name: 'PASTILLA COBREQ' })).toBeInTheDocument()
    expect(screen.queryByText('API GL-5')).not.toBeInTheDocument()
    expect(screen.queryByText('Grupo alternativo 5404')).not.toBeInTheDocument()
  })

  it('sin equivalentes ni detalles usa la descripción como título y sin modelos no muestra la sección', () => {
    render(
      <ArticleCard
        box={{ ...box, details: [], compatibleModels: [], alternatives: [] }}
        warehouses={warehouses}
        query=""
      />,
    )
    expect(screen.getByRole('heading', { name: 'PASTILLA DE FRENO' })).toBeInTheDocument()
    expect(screen.queryByText('Modelos')).not.toBeInTheDocument()
  })

  it('sin modelos, los equivalentes siguen en su columna (precio y stock no se corren)', () => {
    render(<ArticleCard box={{ ...box, compatibleModels: [] }} warehouses={warehouses} query="" />)
    const list = screen.getByText('FRIC-ROT').closest('ul')!
    expect(list).toHaveClass('lg:col-start-4')
  })
})

describe('yearRange', () => {
  it('cubre todas las combinaciones', () => {
    expect(yearRange({ brandName: 'A', model: 'B', since: '2000', until: '2005' })).toBe('2000/2005')
    expect(yearRange({ brandName: 'A', model: 'B', since: '2000' })).toBe('desde 2000')
    expect(yearRange({ brandName: 'A', model: 'B', until: '2005' })).toBe('hasta 2005')
    expect(yearRange({ brandName: 'A', model: 'B' })).toBeNull()
  })
})
