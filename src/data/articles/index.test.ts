import { describe, expect, it } from 'vitest'
import { ApiArticlesRepository } from './api/ApiArticlesRepository'
import { articlesRepository, createArticlesRepository } from './index'
import { MockArticlesRepository } from './mock/MockArticlesRepository'

describe('createArticlesRepository', () => {
  it('con "mock" devuelve el repositorio hardcodeado', () => {
    expect(createArticlesRepository('mock')).toBeInstanceOf(MockArticlesRepository)
  })

  it('con "api" devuelve el repositorio HTTP', () => {
    expect(createArticlesRepository('api', 'https://api.test')).toBeInstanceOf(ApiArticlesRepository)
  })

  it('con "api" sin URL falla con mensaje claro', () => {
    expect(() => createArticlesRepository('api', '')).toThrow(/VITE_API_URL/)
  })

  it('la instancia por defecto usa mock cuando no hay env configurado', () => {
    expect(articlesRepository).toBeInstanceOf(MockArticlesRepository)
  })
})
