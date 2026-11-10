import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(() => {
  // BrowserRouter usa la URL real de jsdom: cada test arranca en la raíz.
  window.history.replaceState(null, '', '/')
})

describe('App', () => {
  it('muestra el login si no hay sesión', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('flujo completo: login con 123/123, entra al catálogo, va al carrito y sale', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Usuario'), '123')
    await user.type(screen.getByLabelText('Contraseña'), '123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await screen.findByRole('button', { name: 'Salir' })
    expect(screen.getByRole('searchbox', { name: 'Buscar repuestos' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ingresar' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Ir al carrito' }))
    expect(screen.getByRole('heading', { name: 'Tu carrito' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Historial de pedidos' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('article', { name: 'Nota de pedido 00000120' })).toBeInTheDocument())

    // Cada pantalla monta su propio header: el botón Salir se busca de nuevo.
    await user.click(screen.getByRole('button', { name: 'Salir' }))
    expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('entra directo al catálogo si hay sesión guardada', () => {
    sessionStorage.setItem('auth:user', JSON.stringify({ username: '123', name: 'Gabriel Kriger' }))
    render(<App />)
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar repuestos' })).toBeInTheDocument()
  })

  it('una ruta desconocida vuelve al catálogo', () => {
    sessionStorage.setItem('auth:user', JSON.stringify({ username: '123', name: 'Gabriel Kriger' }))
    window.history.replaceState(null, '', '/no-existe')
    render(<App />)
    expect(screen.getByRole('searchbox', { name: 'Buscar repuestos' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })
})
