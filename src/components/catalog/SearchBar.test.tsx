import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('avisa cada cambio de texto', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar repuestos' }), 'ab')
    expect(onChange).toHaveBeenCalledWith('a')
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('muestra el botón de limpiar solo cuando hay texto y lo vacía al clickear', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<SearchBar value="" onChange={onChange} />)
    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).not.toBeInTheDocument()

    rerender(<SearchBar value="fiat" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(onChange).toHaveBeenCalledWith('')
  })
})
