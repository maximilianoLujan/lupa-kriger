import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StockFilter } from './StockFilter'

describe('StockFilter', () => {
  it('es un checkbox con la etiqueta "Solo con stock" y refleja su estado', () => {
    const { rerender } = render(<StockFilter checked={false} onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Solo con stock' })).not.toBeChecked()

    rerender(<StockFilter checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Solo con stock' })).toBeChecked()
  })

  it('avisa el nuevo valor al tocar el checkbox o su etiqueta', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StockFilter checked={false} onChange={onChange} />)

    await user.click(screen.getByRole('checkbox', { name: 'Solo con stock' }))
    await user.click(screen.getByText('Solo con stock'))
    expect(onChange.mock.calls).toEqual([[true], [true]])
  })

  it('se puede tildar con el teclado', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StockFilter checked={false} onChange={onChange} />)

    await user.tab()
    expect(screen.getByRole('checkbox', { name: 'Solo con stock' })).toHaveFocus()
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
