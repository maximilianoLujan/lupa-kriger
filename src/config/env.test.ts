import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadEnv() {
  vi.resetModules()
  return (await import('./env')).env
}

describe('env', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('por defecto usa mock y API vacía', async () => {
    vi.stubEnv('VITE_DATA_SOURCE', '')
    vi.stubEnv('VITE_API_URL', '')
    const env = await loadEnv()
    expect(env.dataSource).toBe('mock')
    expect(env.apiUrl).toBe('')
  })

  it('acepta api y limpia la barra final de la URL', async () => {
    vi.stubEnv('VITE_DATA_SOURCE', 'api')
    vi.stubEnv('VITE_API_URL', 'https://api.test/')
    const env = await loadEnv()
    expect(env.dataSource).toBe('api')
    expect(env.apiUrl).toBe('https://api.test')
  })

  it('cualquier otro valor cae en mock', async () => {
    vi.stubEnv('VITE_DATA_SOURCE', 'otra-cosa')
    expect((await loadEnv()).dataSource).toBe('mock')
  })
})
