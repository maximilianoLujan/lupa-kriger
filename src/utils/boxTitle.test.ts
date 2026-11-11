import { describe, expect, it } from 'vitest'
import type { AlternativeArticle, ProductBox } from '../types/article'
import { boxTitle, stripCode } from './boxTitle'

function alt(code: string, description: string, stock: Record<string, number> = {}): AlternativeArticle {
  return { articleCode: code, particularCode: code, description, brandCode: '', brandName: '', priceList: 0, stock }
}

function box(alternatives: AlternativeArticle[], overrides: Partial<ProductBox> = {}): ProductBox {
  return {
    articleCode: 'L60197-SHELL',
    description: '5404',
    details: ['API GL-5', 'Grupo alternativo 5404 del sistema anterior'],
    compatibleModels: [],
    alternatives,
    ...overrides,
  }
}

describe('stripCode', () => {
  it('saca el código del medio, del principio y del final', () => {
    expect(stripCode('FILTRO W 712/75 MANN', 'W 712/75')).toBe('FILTRO MANN')
    expect(stripCode('FR-1024 - PASTILLA DE FRENO', 'FR-1024')).toBe('PASTILLA DE FRENO')
    expect(stripCode('PASTILLA DE FRENO (FR-1024)', 'FR-1024')).toBe('PASTILLA DE FRENO')
    expect(stripCode('ACEITE - 85W140-20-YPF - MINERAL', '85W140-20-YPF')).toBe('ACEITE - MINERAL')
  })

  it('no distingue mayúsculas', () => {
    expect(stripCode('Pastilla fr-1024 delantera', 'FR-1024')).toBe('Pastilla delantera')
  })

  it('no toca el código cuando es parte de otra palabra', () => {
    expect(stripCode('ACEITE 85W140 X20LITROS', '140')).toBe('ACEITE 85W140 X20LITROS')
  })

  it('deja la descripción igual si no tiene el código o si era solo el código', () => {
    expect(stripCode('ACEITE HIPOIDAL', 'X-1')).toBe('ACEITE HIPOIDAL')
    expect(stripCode('FR-1024', 'FR-1024')).toBe('FR-1024')
    expect(stripCode('ACEITE', '')).toBe('ACEITE')
  })
})

describe('boxTitle', () => {
  it('usa la descripción del primer equivalente con stock', () => {
    const title = boxTitle(
      box([
        alt('L60197-SHELL', 'ACEITE TRANSMISION SHELL SPIRAX'),
        alt('01VA829-VALVO', 'ACEITE TRANSMISION VALVOLINE', { '001': 0 }),
        alt('85W140-20-YPF', 'ACEITE TRASMISION HIPOIDAL 85W140 X20 LITROS YPF', { '001': 4 }),
      ]),
    )
    expect(title).toBe('ACEITE TRASMISION HIPOIDAL 85W140 X20 LITROS YPF')
  })

  it('si ninguno tiene stock usa el primero', () => {
    expect(boxTitle(box([alt('A', 'ACEITE SHELL'), alt('B', 'ACEITE YPF')]))).toBe('ACEITE SHELL')
  })

  it('saca el código del equivalente de su descripción', () => {
    expect(boxTitle(box([alt('FR-1024', 'PASTILLA FR-1024 FRIC-ROT', { GUA: 1 })]))).toBe('PASTILLA FRIC-ROT')
  })

  it('sin equivalentes usa el primer detalle, y sin detalles la descripción', () => {
    expect(boxTitle(box([]))).toBe('API GL-5')
    expect(boxTitle(box([], { details: [] }))).toBe('5404')
  })
})
