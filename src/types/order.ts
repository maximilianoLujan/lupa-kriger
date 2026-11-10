/**
 * Estado de una nota de pedido como lo ve el cliente (los mismos códigos que devuelve la API de la Lupa):
 * `pending` emitida, `preparing` la está armando el depósito, `partial` entregada en parte, `completed` entregada o
 * facturada, `cancelled` anulada. Los tres primeros son "en curso"; los otros dos son finales.
 */
export type OrderStatus = 'pending' | 'preparing' | 'partial' | 'completed' | 'cancelled'

/** Un renglón del pedido: el repuesto concreto con la cantidad y los precios al momento de pedirlo. */
export interface OrderItem {
  articleCode: string
  particularCode: string
  brandName: string
  description: string
  quantity: number
  /** Precio unitario final (con IVA) al momento del pedido, no el de lista actual. */
  unitPrice: number
  /** Importe del renglón con IVA y descuentos. */
  total: number
}

export interface Order {
  id: string
  /** Título del comprobante tal como lo nombra el ERP (ej. "Nota de pedido 00000123"). */
  number: string
  /** Fecha de emisión en ISO 8601. */
  createdAt: string
  status: OrderStatus
  items: OrderItem[]
  /** Total del pedido con IVA. */
  total: number
}

/** Lo que se manda al enviar el carrito: cada repuesto por su código (el que ve el cliente) y la cantidad. */
export interface CreateOrderInput {
  items: { code: string; quantity: number }[]
  /** Observaciones para la empresa (opcional). */
  notes?: string
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
