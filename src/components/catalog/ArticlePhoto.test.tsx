import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import logo from '../../assets/logo.jpg'
import { ArticlePhoto } from './ArticlePhoto'

describe('ArticlePhoto', () => {
  it('sin URL muestra el logo del cliente y no se puede abrir en grande', () => {
    render(<ArticlePhoto alt="Pastilla" />)
    expect(screen.getByRole('img', { name: 'Pastilla' })).toHaveAttribute('src', logo)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('con URL muestra la foto', () => {
    render(<ArticlePhoto src="/foto.jpg" alt="Pastilla" />)
    expect(screen.getByRole('img', { name: 'Pastilla' })).toHaveAttribute('src', '/foto.jpg')
  })

  it('si la foto falla al cargar, cae al logo', () => {
    render(<ArticlePhoto src="/rota.jpg" alt="Pastilla" />)
    fireEvent.error(screen.getByRole('img', { name: 'Pastilla' }))
    expect(screen.getByRole('img', { name: 'Pastilla' })).toHaveAttribute('src', logo)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('al tocar la foto se abre en grande con la URL completa y se cierra con Cerrar', async () => {
    const user = userEvent.setup()
    render(<ArticlePhoto src="/thumb.jpg" fullSrc="/grande.jpg" alt="Pastilla" />)
    const open = screen.getByRole('button', { name: 'Ver foto de Pastilla en grande' })

    await user.click(open)
    const dialog = screen.getByRole('dialog', { name: 'Foto de Pastilla' })
    expect(within(dialog).getByRole('img', { name: 'Pastilla' })).toHaveAttribute('src', '/grande.jpg')

    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(open).toHaveFocus()
  })

  it('sin URL completa, el visor abre la misma foto', async () => {
    const user = userEvent.setup()
    render(<ArticlePhoto src="/foto.jpg" alt="Pastilla" />)
    await user.click(screen.getByRole('button', { name: /ver foto/i }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('img', { name: 'Pastilla' })).toHaveAttribute('src', '/foto.jpg')
  })
})
