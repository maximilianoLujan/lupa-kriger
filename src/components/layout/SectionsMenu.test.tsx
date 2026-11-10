import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithProviders } from '../../test/render'
import { NAV_ITEMS } from './navItems'
import { SectionsMenu } from './SectionsMenu'

function Location() {
  return <p data-testid="location">{useLocation().pathname}</p>
}

function setup(route = '/') {
  const user = userEvent.setup()
  renderWithProviders(
    <>
      <SectionsMenu />
      <Routes>
        <Route path="*" element={<Location />} />
      </Routes>
      <button type="button">Afuera</button>
    </>,
    { route },
  )
  return { user }
}

describe('SectionsMenu', () => {
  it('arranca cerrado y se abre con el botón de secciones', async () => {
    const { user } = setup()
    const trigger = screen.getByRole('button', { name: 'Secciones' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu', { name: 'Secciones' })).toBeInTheDocument()
  })

  it('lista las secciones disponibles como links y las bloqueadas como "Próximamente"', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Secciones' }))

    for (const item of NAV_ITEMS.filter((i) => i.to)) {
      expect(screen.getByRole('menuitem', { name: item.label })).toHaveAttribute('href', item.to)
    }
    const locked = NAV_ITEMS.filter((i) => !i.to)
    expect(locked.length).toBeGreaterThan(0)
    for (const item of locked) {
      const menuitem = screen.getByRole('menuitem', { name: new RegExp(item.label) })
      expect(menuitem).toHaveAttribute('aria-disabled', 'true')
      expect(menuitem).toHaveTextContent('Próximamente')
    }
  })

  it('marca la sección actual', async () => {
    const { user } = setup('/carrito')
    await user.click(screen.getByRole('button', { name: 'Secciones' }))
    expect(screen.getByRole('menuitem', { name: 'Carrito' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('menuitem', { name: 'Catálogo' })).not.toHaveAttribute('aria-current')
  })

  it('al elegir una sección navega y se cierra', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Secciones' }))
    await user.click(screen.getByRole('menuitem', { name: 'Carrito' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/carrito')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('se cierra con Escape y al tocar afuera', async () => {
    const { user } = setup()
    const trigger = screen.getByRole('button', { name: 'Secciones' })

    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Afuera' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
