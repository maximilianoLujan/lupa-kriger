/** Estado de un pedido. Los tres primeros son "en curso"; los otros dos son finales. */
export type OrderStatus = 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'

/** Un renglón del pedido: el repuesto concreto con la cantidad y el precio al momento de pedirlo. */
export interface OrderItem {
  articleCode: string
  particularCode: string
  brandName: string
  description: string
  quantity: number
  /** Precio unitario al momento del pedido (no el de lista actual). */
  unitPrice: number
}

export interface Order {
  id: string
  /** Número visible para el cliente (ej. "P-000123"). */
  number: string
  /** Fecha de creación en ISO 8601. */
  createdAt: string
  status: OrderStatus
  items: OrderItem[]
  total: number
}

export interface PageParams {
  /** 1-based. */
  page: number
  pageSize?: number
}

export interface OrdersResponse {
  data: Order[]
  page: number
  hasMore: boolean
  total: number
}
