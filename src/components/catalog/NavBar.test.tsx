import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NavBar } from './NavBar'
import { NAV_ITEMS } from './navItems'

describe('NavBar', () => {
  it('marca Catálogo como sección actual y no navega al clickearlo', async () => {
    render(<NavBar />)
    const link = screen.getByRole('link', { name: 'Catálogo' })
    expect(link).toHaveAttribute('aria-current', 'page')
    await userEvent.click(link)
    expect(window.location.hash).toBe('')
  })

  it('cada funcionalidad bloqueada tiene su tooltip "Próximamente"', () => {
    render(<NavBar />)
    const locked = NAV_ITEMS.filter((i) => i.locked)
    expect(locked.length).toBeGreaterThan(0)

    for (const item of locked) {
      const button = screen.getByRole('button', { name: item.label })
      expect(button).toHaveAttribute('aria-disabled', 'true')
      const tooltip = document.getElementById(button.getAttribute('aria-describedby')!)
      expect(tooltip).toHaveAttribute('role', 'tooltip')
      expect(tooltip).toHaveTextContent('Próximamente')
    }
  })

  it('al tocar un bloqueado se abre el tooltip y al volver a tocar se cierra', async () => {
    render(<NavBar />)
    const button = screen.getByRole('button', { name: 'Pedidos' })
    const tooltip = document.getElementById(button.getAttribute('aria-describedby')!)!

    expect(tooltip).not.toHaveAttribute('data-open')
    await userEvent.click(button)
    expect(tooltip).toHaveAttribute('data-open', 'true')
    await userEvent.click(button)
    expect(tooltip).not.toHaveAttribute('data-open')
  })

  it('al perder el foco se cierra el tooltip', async () => {
    render(<NavBar />)
    const button = screen.getByRole('button', { name: 'Ofertas' })
    const tooltip = document.getElementById(button.getAttribute('aria-describedby')!)!
    await userEvent.click(button)
    expect(tooltip).toHaveAttribute('data-open', 'true')
    await userEvent.tab()
    expect(tooltip).not.toHaveAttribute('data-open')
  })

  it('acepta items y sección actual custom', () => {
    render(
      <NavBar
        current="b"
        items={[
          { key: 'a', label: 'A', tone: 'sky', icon: <span /> },
          { key: 'b', label: 'B', tone: 'mint', icon: <span /> },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'B' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'A' })).not.toHaveAttribute('aria-current')
  })
})
