import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ArticleCode } from './ArticleCode'

describe('ArticleCode', () => {
  it('sin acción es texto común', () => {
    render(<ArticleCode code="FR-1024" />)
    expect(screen.getByText('FR-1024')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('abre la ficha con doble clic, no con uno solo', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(<ArticleCode code="FR-1024" onOpen={onOpen} />)
    const code = screen.getByRole('button', { name: 'Ver la ficha de FR-1024' })
    expect(code).toHaveAttribute('title', 'Doble clic para ver la ficha')

    await user.click(code)
    expect(onOpen).not.toHaveBeenCalled()

    await user.dblClick(code)
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('FR-1024')
  })

  it('con el teclado se abre con Enter', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(
      <ArticleCode code="FR-1024" onOpen={onOpen}>
        <mark>FR</mark>-1024
      </ArticleCode>,
    )
    await user.tab()
    await user.keyboard('{Enter}')
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('FR-1024')
  })
})
