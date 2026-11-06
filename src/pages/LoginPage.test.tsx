import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../test/render'
import { LoginPage } from './LoginPage'

function setup() {
  const user = userEvent.setup()
  renderWithProviders(<LoginPage />)
  return {
    user,
    username: screen.getByLabelText('Usuario'),
    password: screen.getByLabelText('Contraseña'),
    submit: screen.getByRole('button', { name: /ingresar/i }),
  }
}

describe('LoginPage', () => {
  it('muestra el logo del cliente y el formulario', () => {
    setup()
    expect(screen.getByAltText(/repuestos guatrache/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('muestra error con credenciales inválidas', async () => {
    const { user, username, password, submit } = setup()
    await user.type(username, 'x')
    await user.type(password, 'y')
    await user.click(submit)

    expect(await screen.findByRole('alert')).toHaveTextContent(/incorrectos/i)
    expect(username).toHaveAttribute('aria-invalid', 'true')
  })

  it('deshabilita el botón mientras valida', async () => {
    const { user, username, password, submit } = setup()
    await user.type(username, '123')
    await user.type(password, '123')
    await user.click(submit)

    expect(submit).toBeDisabled()
    expect(submit).toHaveTextContent(/ingresando/i)
  })

  it('permite mostrar y ocultar la contraseña', async () => {
    const { user, password } = setup()
    expect(password).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /mostrar contraseña/i }))
    expect(password).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /ocultar contraseña/i }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('limpia el error al reintentar', async () => {
    const { user, username, password, submit } = setup()
    await user.type(username, 'x')
    await user.type(password, 'y')
    await user.click(submit)
    await screen.findByRole('alert')

    await user.clear(username)
    await user.type(username, '123')
    await user.clear(password)
    await user.type(password, '123')
    await user.click(submit)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
