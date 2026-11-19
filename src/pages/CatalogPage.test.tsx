import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import type { ArticlesRepository } from '../data/articles'
import { MockArticlesRepository } from '../data/articles/mock/MockArticlesRepository'
import { renderWithProviders } from '../test/render'
import { CatalogPage } from './CatalogPage'

const repo = new MockArticlesRepository({ delayMs: 0 })

function renderCatalog(repository: ArticlesRepository) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<CatalogPage repository={repository} />} />
      <Route path="/carrito" element={<p>Página carrito</p>} />
    </Routes>,
  )
}

async function setup(repository: ArticlesRepository = repo) {
  sessionStorage.setItem('auth:user', JSON.stringify({ username: '123', name: 'Gabriel Kriger' }))
  const user = userEvent.setup()
  renderCatalog(repository)
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  return { user }
}

describe('CatalogPage', () => {
  it('muestra el catálogo completo al entrar, con cabecera de columnas', async () => {
    await setup()
    expect(screen.getAllByRole('article')).toHaveLength(10)
    expect(screen.getByText('DESCRIPCIÓN')).toBeInTheDocument()
    expect(screen.getAllByText('STOCK').length).toBeGreaterThan(0)
  })

  it('no muestra la cantidad de resultados', async () => {
    await setup()
    expect(screen.queryByText(/resultado/i)).not.toBeInTheDocument()
  })

  it('la cabecera de columnas va dentro del header fijo, así queda a la vista al hacer scroll', async () => {
    await setup()
    const columns = screen.getByRole('group', { name: 'Columnas del listado' })
    expect(screen.getByRole('banner')).toContainElement(columns)
    expect(screen.getByRole('banner')).toHaveClass('sticky', 'top-0')
  })

  it('"Solo con stock" oculta los artículos sin stock y al destildarlo vuelven', async () => {
    const { user } = await setup()
    await user.type(screen.getByRole('searchbox'), 'cobreq')
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(screen.getByText('COBREQ')).toBeInTheDocument()

    const filter = screen.getByRole('checkbox', { name: 'Solo con stock' })
    expect(screen.getByRole('banner')).toContainElement(filter)
    expect(filter).not.toBeChecked()

    await user.click(filter)
    await waitFor(() => expect(screen.queryByText('COBREQ')).not.toBeInTheDocument())
    expect(screen.getByText('FRIC-ROT')).toBeInTheDocument()

    await user.click(filter)
    await waitFor(() => expect(screen.getByText('COBREQ')).toBeInTheDocument())
  })

  it('con "Solo con stock" el filtro sigue a la vista aunque no quede ningún artículo', async () => {
    const search = vi.fn(async () => ({ data: [], page: 1, hasMore: false, total: 0 }))
    const empty: ArticlesRepository = {
      search,
      getArticle: (c) => repo.getArticle(c), getWarehouses: () => repo.getWarehouses(),
      getOrders: (p) => repo.getOrders(p),
      createOrder: (i) => repo.createOrder(i),
    }
    const { user } = await setup(empty)
    await user.click(screen.getByRole('checkbox', { name: 'Solo con stock' }))
    await waitFor(() => expect(search).toHaveBeenLastCalledWith(expect.objectContaining({ inStock: true })))
    expect(screen.getByText('No se encontraron repuestos')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Solo con stock' })).toBeChecked()
  })

  it('"Comienza con" va al lado de "Solo con stock" y trae solo lo que empieza con la búsqueda', async () => {
    const { user } = await setup()
    const filter = screen.getByRole('checkbox', { name: 'Comienza con' })
    const filters = screen.getByRole('group', { name: 'Filtros' })
    expect(screen.getByRole('banner')).toContainElement(filters)
    expect(filters).toContainElement(filter)
    expect(filters).toContainElement(screen.getByRole('checkbox', { name: 'Solo con stock' }))
    expect(filter).not.toBeChecked()

    // "aceite" está en el medio de la descripción: sale sin el filtro y no con él.
    await user.type(screen.getByRole('searchbox'), 'aceite')
    await waitFor(() => expect(screen.getByText('MANN')).toBeInTheDocument())

    await user.click(filter)
    await waitFor(() => expect(screen.getByText('No se encontraron repuestos')).toBeInTheDocument())
    expect(filter).toBeChecked()

    // El comienzo de la descripción sí.
    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'filtro de ac')
    await waitFor(() => expect(screen.getByText('MANN')).toBeInTheDocument())

    await user.click(filter)
    expect(filter).not.toBeChecked()
  })

  it('carga más resultados con el botón', async () => {
    const { user } = await setup()
    await user.click(screen.getByRole('button', { name: 'Cargar más' }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(12))
    expect(screen.queryByRole('button', { name: 'Cargar más' })).not.toBeInTheDocument()
  })

  it('filtra al escribir y resalta la búsqueda', async () => {
    const { user } = await setup()
    await user.type(screen.getByRole('searchbox'), 'bujia')

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    // El título de la cajita es la descripción del primer equivalente con stock.
    expect(screen.getByRole('heading', { name: /Bujía\s*NGK/ })).toBeInTheDocument()
    expect(screen.getByText((_, el) => el?.tagName === 'MARK' && el.textContent === 'Bujía')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay coincidencias', async () => {
    const { user } = await setup()
    await user.type(screen.getByRole('searchbox'), 'zzzz')
    await waitFor(() => expect(screen.getByText('No se encontraron repuestos')).toBeInTheDocument())
    expect(screen.queryByText('DESCRIPCIÓN')).not.toBeInTheDocument()
  })

  it('muestra el error del repositorio y reintenta', async () => {
    let fail = true
    const flaky: ArticlesRepository = {
      search: async (params) => {
        if (fail) throw new Error('Sin conexión')
        return repo.search(params)
      },
      getArticle: (c) => repo.getArticle(c), getWarehouses: () => repo.getWarehouses(),
      getOrders: (p) => repo.getOrders(p),
      createOrder: (i) => repo.createOrder(i),
    }
    const { user } = await setup(flaky)
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión')

    fail = false
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('las secciones viven en el menú desplegable, no como chips en el header', async () => {
    const { user } = await setup()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.queryByText('Favoritos')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Secciones' }))
    expect(screen.getByRole('menuitem', { name: 'Catálogo' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('menuitem', { name: /Favoritos/ })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('menuitem', { name: /Pedidos/ })).toHaveTextContent('Próximamente')
  })

  it('agrega al carrito desde una fila y el botón del carrito lleva a la página del carrito', async () => {
    const { user } = await setup()
    expect(screen.getByRole('link', { name: 'Ir al carrito' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Agregar FRIC-ROT FR-1024 al carrito' }))
    // El botón se reemplaza por el control de cantidad.
    expect(screen.queryByRole('button', { name: 'Agregar FRIC-ROT FR-1024 al carrito' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sumar FR-1024' }))
    await user.click(screen.getByRole('button', { name: 'Agregar MANN W 712/75 al carrito' }))

    await user.click(screen.getByRole('link', { name: 'Ir al carrito, 3 unidades' }))
    expect(screen.getByText('Página carrito')).toBeInTheDocument()
  })

  it('muestra el nombre del usuario con iniciales y permite salir', async () => {
    const { user } = await setup()
    expect(screen.getByText('Gabriel Kriger')).toBeInTheDocument()
    expect(screen.getByText('GK')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Salir' }))
    expect(sessionStorage.getItem('auth:user')).toBeNull()
  })

  it('no setea sucursales si se desmonta antes de la respuesta', async () => {
    const getWarehouses = vi.fn(() => new Promise<never>(() => {}))
    const pending: ArticlesRepository = { search: (p) => repo.search(p), getArticle: (c) => repo.getArticle(c), getWarehouses, getOrders: (p) => repo.getOrders(p), createOrder: (i) => repo.createOrder(i) }
    sessionStorage.setItem('auth:user', JSON.stringify({ username: '123', name: 'G' }))
    const { unmount } = renderCatalog(pending)
    unmount()
    expect(getWarehouses).toHaveBeenCalledTimes(1)
  })

  it('con doble clic en un código abre la ficha del artículo y desde ahí pasa a un alternativo', async () => {
    const { user } = await setup()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.dblClick(screen.getByRole('button', { name: 'Ver la ficha de HQF-2234C' }))
    const dialog = await screen.findByRole('dialog', { name: 'Ficha del artículo HQF-2234C' })
    expect(await within(dialog).findByRole('heading', { name: 'Pastilla freno delantera Ferodo' })).toBeInTheDocument()
    expect(within(dialog).getByText('Margen sobre costo')).toBeInTheDocument()

    // Doble clic en un alternativo: la ficha pasa a ese artículo.
    await user.dblClick(within(dialog).getByRole('button', { name: 'Ver la ficha de FR-1024' }))
    const next = await screen.findByRole('dialog', { name: 'Ficha del artículo FR-1024' })
    expect(await within(next).findByRole('heading', { name: 'Pastilla freno delantera Fric-Rot' })).toBeInTheDocument()

    await user.click(within(next).getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('resalta en el listado los precios que llevan más de 30 días sin cambios', async () => {
    await setup()
    // En el mock, el Ferodo de la primera cajita tiene un precio viejo; el Fric-Rot no tiene fecha.
    expect(screen.getByText('$ 34.500')).toHaveClass('bg-butter')
    expect(screen.getByText('$ 28.900')).not.toHaveClass('bg-butter')
  })
})
