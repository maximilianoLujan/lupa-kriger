import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import logo from '../../assets/logo.jpg'
import { ArticlePhoto } from './ArticlePhoto'

describe('ArticlePhoto', () => {
  it('sin URL muestra el logo del cliente', () => {
    render(<ArticlePhoto alt="Pastilla" />)
    expect(screen.getByRole('img', { name: 'Pastilla' })).toHaveAttribute('src', logo)
  })

  it('con URL muestra la foto', () => {
    render(<ArticlePhoto src="/foto.jpg" alt="Pastilla" />)
    expect(screen.getByRole('img', { name: 'Pastilla' })).toHaveAttribute('src', '/foto.jpg')
  })

  it('si la foto falla al cargar, cae al logo', () => {
    render(<ArticlePhoto src="/rota.jpg" alt="Pastilla" />)
    const img = screen.getByRole('img', { name: 'Pastilla' })
    fireEvent.error(img)
    expect(img).toHaveAttribute('src', logo)
  })
})
