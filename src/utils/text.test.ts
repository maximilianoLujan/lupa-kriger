import { describe, expect, it } from 'vitest'
import { escapeRegExp, normalizeText, searchWords, tokenize } from './text'

describe('normalizeText', () => {
  it('pasa a minúsculas y saca acentos', () => {
    expect(normalizeText('  Bujía NGK  ')).toBe('bujia ngk')
  })
})

describe('tokenize', () => {
  it('separa por espacios e ignora vacíos', () => {
    expect(tokenize('  fiat   palio ')).toEqual(['fiat', 'palio'])
    expect(tokenize('')).toEqual([])
  })
})

describe('escapeRegExp', () => {
  it('escapa caracteres especiales', () => {
    expect(new RegExp(escapeRegExp('W 712/75+')).test('W 712/75+')).toBe(true)
    expect(escapeRegExp('a.b')).toBe('a\\.b')
  })
})

describe('searchWords', () => {
  it('saca los conectores y las repetidas', () => {
    expect(searchWords('Bomba PARA el agua de Megane')).toEqual(['bomba', 'agua', 'megane'])
    expect(searchWords('filtro filtro con junta')).toEqual(['filtro', 'junta'])
  })

  it('no confunde un conector con el comienzo de una palabra', () => {
    expect(searchWords('paragolpes de gol')).toEqual(['paragolpes', 'gol'])
  })

  it('si lo buscado son solo conectores, se buscan tal cual', () => {
    expect(searchWords('para')).toEqual(['para'])
    expect(searchWords('de la')).toEqual(['de', 'la'])
    expect(searchWords('  ')).toEqual([])
  })
})
