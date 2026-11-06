import { describe, expect, it } from 'vitest'
import { escapeRegExp, normalizeText, tokenize } from './text'

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
