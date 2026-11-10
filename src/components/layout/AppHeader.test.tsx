import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useCartStore } from '../../cart/store'
import { renderWithProviders } from '../../test/render'
import type { AlternativeArticle } from '../../types/article'
import { AppHeader } from './AppHeader'

const article: AlternativeArticle = {
  articleCode: 'a',
  particularCode: 'FR-1',
  description: '',
  brandCode: '',
  brandName: 'FRIC-ROT',
  priceList: 1000,
  stock: {},
}

function Location() {
  return <p data-testid="location">{useLocation().pathname}</p>
}

function setup(route = '/') {
  sessionStorage.setItem('auth:user', JSON.stringify({ username: '123', name: 'Gabriel Kriger' }))
  const user = userEvent.setup()
  renderWithProviders(
    <>
      <AppHeader>
        <p>Contenido extra</p>
      </AppHeader>
      <Routes>
        <Route path="*" element={<Location />} />
      </Routes>
    </>,
    { route },
  )
  return { user }
}

describe('AppHeader', () => {
  it('muestra el logo, el usuario con iniciales y el contenido extra', () => {
    setup()
    expect(screen.getByRole('link', { name: 'Ir al catálogo' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Gabriel Kriger')).toBeInTheDocument()
    expect(screen.getByText('GK')).toBeInTheDocument()
    expect(screen.getByText('Contenido extra')).toBeInTheDocument()
  })

  it('el carrito lleva a /carrito y muestra la cantidad', async () => {
    useCartStore.setState({ items: [{ article, quantity: 3 }] })
    const { user } = setup()
    const cart = screen.getByRole('link', { name: 'Ir al carrito, 3 unidades' })
    expect(cart).toHaveTextContent('3')
    await user.click(cart)
    expect(screen.getByTestId('location')).toHaveTextContent('/carrito')
    expect(cart).toHaveAttribute('aria-current', 'page')
  })

  it('sin items el carrito no muestra contador', () => {
    setup()
    expect(screen.getByRole('link', { name: 'Ir al carrito' })).toBeInTheDocument()
  })

  it('tiene el menú de secciones y permite salir', async () => {
    const { user } = setup()
    expect(screen.getByRole('button', { name: 'Secciones' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Salir' }))
    expect(sessionStorage.getItem('auth:user')).toBeNull()
  })
})
