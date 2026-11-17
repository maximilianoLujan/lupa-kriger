import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StartsWithFilter } from './StartsWithFilter'

describe('StartsWithFilter', () => {
  it('es un checkbox con la etiqueta "Comienza con" y refleja su estado', () => {
    const { rerender } = render(<StartsWithFilter checked={false} onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Comienza con' })).not.toBeChecked()

    rerender(<StartsWithFilter checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Comienza con' })).toBeChecked()
  })

  it('avisa el nuevo valor al tocar el checkbox o su etiqueta', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StartsWithFilter checked={false} onChange={onChange} />)

    await user.click(screen.getByRole('checkbox', { name: 'Comienza con' }))
    await user.click(screen.getByText('Comienza con'))
    expect(onChange.mock.calls).toEqual([[true], [true]])
  })

  it('se puede tildar con el teclado', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StartsWithFilter checked={false} onChange={onChange} />)

    await user.tab()
    expect(screen.getByRole('checkbox', { name: 'Comienza con' })).toHaveFocus()
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
