import { afterEach, describe, expect, it, vi } from 'vitest'
import { canStoreCredentials, storeCredentials } from './credentialManager'

class FakePasswordCredential {
  readonly id: string
  readonly password: string
  readonly name?: string
  constructor(data: { id: string; password: string; name?: string }) {
    this.id = data.id
    this.password = data.password
    this.name = data.name
  }
}

function installApi() {
  const store = vi.fn(async (c: unknown) => c)
  vi.stubGlobal('PasswordCredential', FakePasswordCredential)
  Object.defineProperty(navigator, 'credentials', { value: { store }, configurable: true })
  return store
}

afterEach(() => {
  vi.unstubAllGlobals()
  // jsdom no trae navigator.credentials: lo sacamos para dejar el entorno como estaba.
  delete (navigator as unknown as { credentials?: unknown }).credentials
})

describe('credentialManager', () => {
  it('sin la API no puede guardar y storeCredentials no hace nada ni falla', async () => {
    expect(canStoreCredentials()).toBe(false)
    await expect(storeCredentials('c@test.local', 'secreto')).resolves.toBeUndefined()
  })

  it('con la API pide guardar usuario, contraseña y nombre', async () => {
    const store = installApi()
    expect(canStoreCredentials()).toBe(true)

    await storeCredentials('c@test.local', 'secreto', 'Cliente')

    expect(store).toHaveBeenCalledTimes(1)
    expect(store.mock.calls[0][0]).toMatchObject({ id: 'c@test.local', password: 'secreto', name: 'Cliente' })
  })

  it('no guarda si falta el usuario o la contraseña', async () => {
    const store = installApi()
    await storeCredentials('', 'secreto')
    await storeCredentials('c@test.local', '')
    expect(store).not.toHaveBeenCalled()
  })

  it('si el navegador rechaza, no lanza', async () => {
    const store = installApi()
    store.mockRejectedValueOnce(new Error('NotAllowedError'))
    await expect(storeCredentials('c@test.local', 'secreto')).resolves.toBeUndefined()
  })
})
