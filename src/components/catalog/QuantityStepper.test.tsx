import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuantityStepper } from './QuantityStepper'

describe('QuantityStepper', () => {
  it('suma y resta de a uno', async () => {
    const onChange = vi.fn()
    render(<QuantityStepper value={2} onChange={onChange} code="FR-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'Sumar FR-1' }))
    expect(onChange).toHaveBeenCalledWith(3)
    await userEvent.click(screen.getByRole('button', { name: 'Restar FR-1' }))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('restar desde 1 manda 0 y nunca negativo', async () => {
    const onChange = vi.fn()
    render(<QuantityStepper value={1} onChange={onChange} code="FR-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'Restar FR-1' }))
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('permite escribir una cantidad y la aplica al salir del campo o con Enter', async () => {
    const onChange = vi.fn()
    render(<QuantityStepper value={1} onChange={onChange} code="FR-1" />)
    const input = screen.getByRole('textbox', { name: 'Cantidad FR-1' })

    await userEvent.clear(input)
    await userEvent.type(input, '12')
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(onChange).toHaveBeenCalledWith(12)

    await userEvent.clear(input)
    await userEvent.type(input, '7{Enter}')
    expect(onChange).toHaveBeenCalledWith(7)
  })

  it('ignora letras y vuelve al valor anterior si queda vacío', async () => {
    const onChange = vi.fn()
    render(<QuantityStepper value={4} onChange={onChange} code="FR-1" />)
    const input = screen.getByRole('textbox', { name: 'Cantidad FR-1' })

    // Al enfocar se selecciona todo; las letras se descartan y el campo queda vacío.
    await userEvent.type(input, 'abc')
    expect(input).toHaveValue('')

    await userEvent.tab()
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('4')

    await userEvent.type(input, '2x5')
    expect(input).toHaveValue('25')
  })

  it('no avisa si se escribe el mismo valor', async () => {
    const onChange = vi.fn()
    render(<QuantityStepper value={4} onChange={onChange} code="FR-1" />)
    const input = screen.getByRole('textbox', { name: 'Cantidad FR-1' })
    await userEvent.clear(input)
    await userEvent.type(input, '4')
    await userEvent.tab()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('refleja el valor nuevo cuando cambia desde afuera', () => {
    const { rerender } = render(<QuantityStepper value={1} onChange={() => {}} code="FR-1" />)
    rerender(<QuantityStepper value={9} onChange={() => {}} code="FR-1" />)
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1' })).toHaveValue('9')
  })
})
