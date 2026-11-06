export type DataSource = 'mock' | 'api'

function readDataSource(raw: string | undefined): DataSource {
  return raw === 'api' ? 'api' : 'mock'
}

export const env = {
  /** De dónde salen los datos: `mock` (hardcodeados) o `api`. */
  dataSource: readDataSource(import.meta.env.VITE_DATA_SOURCE),
  /** URL base de la API, sin barra final. Solo se usa con `dataSource = 'api'`. */
  apiUrl: (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, ''),
}
