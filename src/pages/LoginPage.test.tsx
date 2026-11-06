import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

/**
 * Espera a que un login válido termine (queda la sesión guardada). El mock tarda 500 ms: si el test
 * termina antes, el submit sigue corriendo y contamina al test siguiente.
 */
function loginSettled() {
  return waitFor(() => expect(sessionStorage.getItem('auth:user')).not.toBeNull())
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
    await loginSettled()
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
    await loginSettled()
  })

  it('los campos están marcados para el gestor de contraseñas del navegador', () => {
    const { username, password } = setup()
    expect(username).toHaveAttribute('name', 'username')
    expect(username).toHaveAttribute('autocomplete', 'username')
    expect(password).toHaveAttribute('name', 'password')
    expect(password).toHaveAttribute('autocomplete', 'current-password')
  })

  describe('con la Credential Management API', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
      delete (navigator as unknown as { credentials?: unknown }).credentials
    })

    function installApi() {
      const store = vi.fn(async (c: unknown) => c)
      vi.stubGlobal(
        'PasswordCredential',
        class {
          data: { id: string; password: string }
          constructor(data: { id: string; password: string }) {
            this.data = data
          }
        },
      )
      Object.defineProperty(navigator, 'credentials', { value: { store }, configurable: true })
      return store
    }

    it('tras un login correcto pide al navegador guardar usuario y contraseña', async () => {
      const store = installApi()
      const { user, username, password, submit } = setup()
      await user.type(username, ' 123 ')
      await user.type(password, '123')
      await user.click(screen.getByRole('button', { name: /mostrar contraseña/i }))
      await user.click(submit)

      await waitFor(() => expect(store).toHaveBeenCalledTimes(1))
      expect(store.mock.calls[0][0]).toMatchObject({ data: { id: '123', password: '123' } })
      // Al enviar, la contraseña vuelve a ocultarse para que el navegador reconozca el campo.
      expect(password).toHaveAttribute('type', 'password')
    })

    it('con credenciales inválidas no pide guardar nada', async () => {
      const store = installApi()
      const { user, username, password, submit } = setup()
      await user.type(username, 'x')
      await user.type(password, 'y')
      await user.click(submit)

      await screen.findByRole('alert')
      expect(store).not.toHaveBeenCalled()
    })
  })
})
