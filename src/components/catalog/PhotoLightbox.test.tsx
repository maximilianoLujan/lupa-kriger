import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PhotoLightbox } from './PhotoLightbox'

function setup() {
  const onClose = vi.fn()
  const user = userEvent.setup()
  const view = render(<PhotoLightbox src="/grande.jpg" alt="Pastilla" onClose={onClose} />)
  const dialog = screen.getByRole('dialog', { name: 'Foto de Pastilla' })
  return { onClose, user, view, dialog }
}

describe('PhotoLightbox', () => {
  it('muestra la foto grande en un diálogo modal con el foco en Cerrar', () => {
    const { dialog } = setup()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByRole('img', { name: 'Pastilla' })).toHaveAttribute('src', '/grande.jpg')
    expect(within(dialog).getByRole('button', { name: 'Cerrar' })).toHaveFocus()
  })

  it('se cierra con el botón, con Escape y tocando fuera de la imagen', async () => {
    const { onClose, user, dialog } = setup()

    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)

    await user.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('tocar la imagen no la cierra', async () => {
    const { onClose, user, dialog } = setup()
    await user.click(within(dialog).getByRole('img', { name: 'Pastilla' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('bloquea el scroll de la página mientras está abierto y lo devuelve al cerrar', () => {
    const { view } = setup()
    expect(document.body.style.overflow).toBe('hidden')
    view.unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
