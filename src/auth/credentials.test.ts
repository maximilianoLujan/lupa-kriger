import { describe, expect, it } from 'vitest'
import { authenticate } from './credentials'

describe('authenticate', () => {
  it('devuelve el usuario con credenciales válidas', () => {
    expect(authenticate('123', '123')).toEqual({ username: '123', name: 'Gabriel Kriger' })
  })

  it('ignora espacios alrededor del usuario', () => {
    expect(authenticate('  123  ', '123')).not.toBeNull()
  })

  it('rechaza contraseña incorrecta', () => {
    expect(authenticate('123', 'otra')).toBeNull()
  })

  it('rechaza usuario inexistente', () => {
    expect(authenticate('nadie', '123')).toBeNull()
  })

  it('rechaza campos vacíos', () => {
    expect(authenticate('', '')).toBeNull()
  })
})
