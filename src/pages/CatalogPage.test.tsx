import { screen, waitFor } from '@testing-library/react'
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
    expect(screen.getByText('12 resultados')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(10)
    expect(screen.getByText('DESCRIPCIÓN')).toBeInTheDocument()
    expect(screen.getAllByText('STOCK').length).toBeGreaterThan(0)
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

    await waitFor(() => expect(screen.getByText('1 resultado')).toBeInTheDocument())
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('NGK')).toBeInTheDocument()
    expect(screen.getByText((_, el) => el?.tagName === 'MARK' && el.textContent === 'BUJIA')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay coincidencias', async () => {
    const { user } = await setup()
    await user.type(screen.getByRole('searchbox'), 'zzzz')
    await waitFor(() => expect(screen.getByText('No se encontraron repuestos')).toBeInTheDocument())
    expect(screen.getByText('0 resultados')).toBeInTheDocument()
    expect(screen.queryByText('DESCRIPCIÓN')).not.toBeInTheDocument()
  })

  it('muestra el error del repositorio y reintenta', async () => {
    let fail = true
    const flaky: ArticlesRepository = {
      search: async (params) => {
        if (fail) throw new Error('Sin conexión')
        return repo.search(params)
      },
      getWarehouses: () => repo.getWarehouses(),
      getOrders: (p) => repo.getOrders(p),
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
    const pending: ArticlesRepository = { search: (p) => repo.search(p), getWarehouses, getOrders: (p) => repo.getOrders(p) }
    sessionStorage.setItem('auth:user', JSON.stringify({ username: '123', name: 'G' }))
    const { unmount } = renderCatalog(pending)
    unmount()
    expect(getWarehouses).toHaveBeenCalledTimes(1)
  })
})
