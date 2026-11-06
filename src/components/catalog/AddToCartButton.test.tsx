import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/render'
import type { AlternativeArticle } from '../../types/article'
import { AddToCartButton } from './AddToCartButton'

const article: AlternativeArticle = {
  articleCode: '1-1',
  particularCode: 'FR-1024',
  description: 'Pastilla',
  brandCode: 'FRR',
  brandName: 'FRIC-ROT',
  priceList: 1000,
  stock: {},
}

describe('AddToCartButton', () => {
  it('muestra el botón de agregar y al tocarlo pasa al control de cantidad en 1', async () => {
    renderWithProviders(<AddToCartButton article={article} />)
    await userEvent.click(screen.getByRole('button', { name: 'Agregar FRIC-ROT FR-1024 al carrito' }))

    expect(screen.queryByRole('button', { name: /agregar/i })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1024' })).toHaveValue('1')
  })

  it('suma, resta y permite escribir la cantidad', async () => {
    renderWithProviders(<AddToCartButton article={article} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /agregar/i }))

    await user.click(screen.getByRole('button', { name: 'Sumar FR-1024' }))
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1024' })).toHaveValue('2')

    const input = screen.getByRole('textbox', { name: 'Cantidad FR-1024' })
    await user.clear(input)
    await user.type(input, '15')
    await user.tab()
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1024' })).toHaveValue('15')

    await user.click(screen.getByRole('button', { name: 'Restar FR-1024' }))
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1024' })).toHaveValue('14')
  })

  it('al llegar a 0 vuelve el botón de agregar', async () => {
    renderWithProviders(<AddToCartButton article={article} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /agregar/i }))
    await user.click(screen.getByRole('button', { name: 'Restar FR-1024' }))

    expect(screen.getByRole('button', { name: 'Agregar FRIC-ROT FR-1024 al carrito' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
