import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('por defecto es la acción principal: rojo con texto blanco y ancho completo', () => {
    render(<Button>Ingresar</Button>)
    const button = screen.getByRole('button', { name: 'Ingresar' })
    expect(button).toHaveClass('bg-brand', 'text-white', 'w-full', 'h-12')
    expect(button).not.toHaveClass('bg-white', 'text-ink')
  })

  it('la variante secundaria es blanca con texto gris, sin clases en conflicto', () => {
    render(<Button variant="secondary">Cargar más</Button>)
    const button = screen.getByRole('button', { name: 'Cargar más' })
    expect(button).toHaveClass('bg-white', 'text-ink', 'ring-1')
    expect(button).not.toHaveClass('bg-brand', 'text-white')
  })

  it('el tamaño chico no fuerza ancho completo', () => {
    render(<Button size="sm">Reintentar</Button>)
    const button = screen.getByRole('button', { name: 'Reintentar' })
    expect(button).toHaveClass('h-10', 'w-auto')
    expect(button).not.toHaveClass('w-full', 'h-12')
  })

  it('cargando queda deshabilitado y muestra el spinner', () => {
    render(<Button loading>Ingresando…</Button>)
    const button = screen.getByRole('button', { name: 'Ingresando…' })
    expect(button).toBeDisabled()
    expect(button.querySelector('.animate-spin')).not.toBeNull()
  })
})
