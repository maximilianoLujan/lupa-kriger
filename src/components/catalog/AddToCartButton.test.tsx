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
  it('agrega al carrito y muestra la cantidad acumulada', async () => {
    renderWithProviders(<AddToCartButton article={article} />)
    const button = screen.getByRole('button', { name: 'Agregar FRIC-ROT FR-1024 al carrito' })
    expect(screen.queryByLabelText(/en el carrito/)).not.toBeInTheDocument()

    await userEvent.click(button)
    expect(screen.getByLabelText('1 en el carrito')).toBeInTheDocument()

    await userEvent.click(button)
    expect(screen.getByLabelText('2 en el carrito')).toBeInTheDocument()
  })
})
