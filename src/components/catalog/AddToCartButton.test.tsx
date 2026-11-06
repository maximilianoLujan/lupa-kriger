import { screen, waitFor } from '@testing-library/react'
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

const ADD = 'Agregar FRIC-ROT FR-1024 al carrito'
const inCartLabel = (n: number) => `FRIC-ROT FR-1024: ${n} en el carrito, cambiar cantidad`
const IDLE = 300
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function setup() {
  renderWithProviders(<AddToCartButton article={article} idleMs={IDLE} />)
  return userEvent.setup()
}

describe('AddToCartButton', () => {
  it('al tocar agrega 1 y abre el control de cantidad', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: ADD }))

    expect(screen.queryByRole('button', { name: ADD })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1024' })).toHaveValue('1')
  })

  it('tras unos segundos sin actividad se cierra y muestra cuántos hay en el carrito', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: ADD }))
    await user.click(screen.getByRole('button', { name: 'Sumar FR-1024' }))
    await user.click(screen.getByRole('button', { name: 'Sumar FR-1024' }))
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1024' })).toHaveValue('3')

    const button = await screen.findByRole('button', { name: inCartLabel(3) })
    expect(button).toHaveTextContent('3')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('cada interacción reinicia el tiempo de cierre', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: ADD }))

    await sleep(IDLE * 0.6)
    await user.click(screen.getByRole('button', { name: 'Sumar FR-1024' }))
    await sleep(IDLE * 0.6)
    // Pasó más del tiempo de cierre desde la apertura, pero no desde el último click.
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1024' })).toHaveValue('2')

    await waitFor(() => expect(screen.getByRole('button', { name: inCartLabel(2) })).toBeInTheDocument())
  })

  it('no se cierra mientras el campo de cantidad tiene el foco', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: ADD }))
    const input = screen.getByRole('textbox', { name: 'Cantidad FR-1024' })
    await user.click(input)
    await user.clear(input)
    await user.type(input, '7')

    await sleep(IDLE * 3)
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1024' })).toBeInTheDocument()

    await user.tab() // al salir se aplica el 7 y arranca el cierre
    await waitFor(() => expect(screen.getByRole('button', { name: inCartLabel(7) })).toBeInTheDocument())
  })

  it('tocar el botón con cantidad vuelve a abrir el control sin agregar de más', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: ADD }))
    const closed = await screen.findByRole('button', { name: inCartLabel(1) })

    await user.click(closed)
    expect(screen.getByRole('textbox', { name: 'Cantidad FR-1024' })).toHaveValue('1')
  })

  it('al llegar a 0 cierra el control y vuelve el botón de agregar', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: ADD }))
    await user.click(screen.getByRole('button', { name: 'Restar FR-1024' }))

    expect(screen.getByRole('button', { name: ADD })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
