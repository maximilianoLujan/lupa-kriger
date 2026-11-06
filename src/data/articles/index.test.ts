import { describe, expect, it } from 'vitest'
import { replyWith } from '../../test/fakeHttp'
import { ApiArticlesRepository } from './api/ApiArticlesRepository'
import { articlesRepository, createArticlesRepository } from './index'
import { MockArticlesRepository } from './mock/MockArticlesRepository'

describe('createArticlesRepository', () => {
  it('con "mock" devuelve el repositorio hardcodeado', () => {
    expect(createArticlesRepository('mock')).toBeInstanceOf(MockArticlesRepository)
  })

  it('con "api" devuelve el repositorio HTTP con el cliente inyectado', () => {
    expect(createArticlesRepository('api', replyWith(200).http)).toBeInstanceOf(ApiArticlesRepository)
  })

  it('con "api" y sin VITE_API_URL falla con mensaje claro', () => {
    expect(() => createArticlesRepository('api')).toThrow(/VITE_API_URL/)
  })

  it('la instancia por defecto usa mock cuando no hay env configurado', () => {
    expect(articlesRepository).toBeInstanceOf(MockArticlesRepository)
  })
})
