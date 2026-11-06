import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Highlight } from './Highlight'

function marks() {
  return screen.queryAllByText((_, el) => el?.tagName === 'MARK').map((m) => m.textContent)
}

describe('Highlight', () => {
  it('sin query devuelve el texto tal cual', () => {
    const { container } = render(<Highlight text="Pastilla de freno" query="" />)
    expect(container.textContent).toBe('Pastilla de freno')
    expect(marks()).toEqual([])
  })

  it('resalta cada palabra de la query, sin importar mayúsculas', () => {
    const { container } = render(<Highlight text="Pastilla de freno delantera" query="FRENO pastilla" />)
    expect(container.textContent).toBe('Pastilla de freno delantera')
    expect(marks()).toEqual(['Pastilla', 'freno'])
  })

  it('resalta aunque el texto tenga tilde y la query no', () => {
    render(<Highlight text="Bujía NGK" query="bujia" />)
    expect(marks()).toEqual(['Bujía'])
  })

  it('no rompe con caracteres especiales en la query', () => {
    render(<Highlight text="W 712/75" query="712/75" />)
    expect(marks()).toEqual(['712/75'])
  })

  it('no resalta nada si no hay coincidencia', () => {
    const { container } = render(<Highlight text="Filtro" query="zzz" />)
    expect(container.textContent).toBe('Filtro')
    expect(marks()).toEqual([])
  })

  it('texto vacío no rompe', () => {
    const { container } = render(<Highlight text="" query="a" />)
    expect(container.textContent).toBe('')
  })
})
