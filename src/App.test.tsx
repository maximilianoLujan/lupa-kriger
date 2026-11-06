import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('muestra el login si no hay sesión', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('flujo completo: login con 123/123, entra al catálogo y sale', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Usuario'), '123')
    await user.type(screen.getByLabelText('Contraseña'), '123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    const salir = await screen.findByRole('button', { name: 'Salir' })
    expect(screen.getByText(/catálogo/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ingresar' })).not.toBeInTheDocument()

    await user.click(salir)
    expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('entra directo al catálogo si hay sesión guardada', () => {
    sessionStorage.setItem('auth:user', JSON.stringify({ username: '123', name: 'Gabriel Kriger' }))
    render(<App />)
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument()
  })
})
