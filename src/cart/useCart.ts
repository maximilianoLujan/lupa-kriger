import { useShallow } from 'zustand/react/shallow'
import { selectCount, selectTotal, useCartStore } from './store'

/** Carrito para componentes: items, totales y acciones. */
export function useCart() {
  return useCartStore(
    useShallow((state) => ({
      items: state.items,
      count: selectCount(state),
      total: selectTotal(state),
      add: state.add,
      setQuantity: state.setQuantity,
      remove: state.remove,
      clear: state.clear,
    })),
  )
}
