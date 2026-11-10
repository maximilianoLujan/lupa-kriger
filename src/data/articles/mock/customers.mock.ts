/** Clientes de la empresa, por su número. En el mock, el pedido solo se acepta para uno de estos. */
export interface MockCustomer {
  code: string
  name: string
}

export const MOCK_CUSTOMERS: MockCustomer[] = [
  { code: '1001', name: 'Taller Norte' },
  { code: '1002', name: 'Lubricentro Sur' },
  { code: '1003', name: 'Gomería El Rápido' },
]

/** Busca el cliente por número tal como lo escribe la persona: con o sin espacios y ceros a la izquierda. */
export function findMockCustomer(code: string): MockCustomer | undefined {
  const typed = code.trim().replace(/^0+(?=\d)/, '')
  return MOCK_CUSTOMERS.find((c) => c.code === typed)
}
