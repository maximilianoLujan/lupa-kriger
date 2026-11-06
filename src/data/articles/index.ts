import { env, type DataSource } from '../../config/env'
import { ApiArticlesRepository } from './api/ApiArticlesRepository'
import { MockArticlesRepository } from './mock/MockArticlesRepository'
import type { ArticlesRepository } from './repository'

export type { ArticlesRepository } from './repository'

/** Construye el repositorio según la fuente elegida. */
export function createArticlesRepository(
  source: DataSource = env.dataSource,
  apiUrl: string = env.apiUrl,
): ArticlesRepository {
  return source === 'api' ? new ApiArticlesRepository(apiUrl) : new MockArticlesRepository()
}

/** Instancia única que usa la app. Cambiá `VITE_DATA_SOURCE` para apuntar a la API. */
export const articlesRepository: ArticlesRepository = createArticlesRepository()
