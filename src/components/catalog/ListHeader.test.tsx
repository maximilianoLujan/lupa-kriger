import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListHeader } from './ListHeader'

describe('ListHeader', () => {
  it('muestra las columnas y el nombre corto de cada sucursal', () => {
    render(
      <ListHeader
        warehouses={[
          { code: 'GUA', shortName: 'GUA', name: 'Guatraché' },
          { code: 'DEP', shortName: 'DEP', name: 'Depósito' },
        ]}
      />,
    )
    expect(screen.getByText('DESCRIPCIÓN')).toBeInTheDocument()
    expect(screen.getByText('MODELO')).toBeInTheDocument()
    // Aparecen en la cabecera mobile y en la desktop.
    expect(screen.getAllByText('GUA')).toHaveLength(2)
    expect(screen.getAllByText('DEP')).toHaveLength(2)
  })
})
