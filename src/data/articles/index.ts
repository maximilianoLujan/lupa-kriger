import type { AxiosInstance } from 'axios'
import { env, type DataSource } from '../../config/env'
import { getHttp } from '../../lib/http'
import { ApiArticlesRepository } from './api/ApiArticlesRepository'
import { MockArticlesRepository } from './mock/MockArticlesRepository'
import type { ArticlesRepository } from './repository'

export type { ArticlesRepository } from './repository'

/** Construye el repositorio según la fuente elegida. Con `api` usa el cliente HTTP compartido salvo que se inyecte otro. */
export function createArticlesRepository(
  source: DataSource = env.dataSource,
  http: AxiosInstance | null = null,
): ArticlesRepository {
  return source === 'api' ? new ApiArticlesRepository(http ?? getHttp()) : new MockArticlesRepository()
}

/** Instancia única que usa la app. Cambiá `VITE_DATA_SOURCE` para apuntar a la API. */
export const articlesRepository: ArticlesRepository = createArticlesRepository()
