import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ArticlesRepository } from '../data/articles'
import type { CreateOrderInput, Order } from '../types/order'
import { queryKeys } from './queryKeys'

/**
 * Envía el carrito como pedido. Al confirmarse, invalida el historial de pedidos para que el nuevo aparezca arriba.
 * Qué hacer con el carrito (vaciarlo, mostrar la confirmación) lo decide la pantalla en `onSuccess`.
 */
export function useCreateOrder(repository: ArticlesRepository) {
  const queryClient = useQueryClient()
  return useMutation<Order, Error, CreateOrderInput>({
    mutationFn: (input) => repository.createOrder(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  })
}
