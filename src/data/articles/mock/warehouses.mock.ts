import type { Warehouse } from '../../../types/article'

/** Un solo depósito por ahora. Si la API devuelve varios, la UI muestra una columna por cada uno. */
export const MOCK_WAREHOUSES: Warehouse[] = [{ code: 'GUA', shortName: 'GUA', name: 'Guatraché' }]
