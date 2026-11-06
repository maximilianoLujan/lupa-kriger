import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListHeader } from './ListHeader'

describe('ListHeader', () => {
  it('con un solo depósito la columna dice STOCK', () => {
    render(<ListHeader warehouses={[{ code: 'GUA', shortName: 'GUA', name: 'Guatraché' }]} />)
    expect(screen.getByText('DESCRIPCIÓN')).toBeInTheDocument()
    expect(screen.getByText('MODELO')).toBeInTheDocument()
    // Aparece en la cabecera mobile y en la desktop.
    expect(screen.getAllByText('STOCK')).toHaveLength(2)
    expect(screen.queryByText('GUA')).not.toBeInTheDocument()
  })

  it('con varios depósitos muestra el nombre corto de cada uno', () => {
    render(
      <ListHeader
        warehouses={[
          { code: 'GUA', shortName: 'GUA', name: 'Guatraché' },
          { code: 'DEP', shortName: 'DEP', name: 'Depósito' },
        ]}
      />,
    )
    expect(screen.getAllByText('GUA')).toHaveLength(2)
    expect(screen.getAllByText('DEP')).toHaveLength(2)
    expect(screen.queryByText('STOCK')).not.toBeInTheDocument()
  })
})
