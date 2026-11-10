import { useCart } from '../cart/useCart'
import { CartItems } from '../components/cart/CartItems'
import { AppHeader } from '../components/layout/AppHeader'
import { OrdersHistory } from '../components/orders/OrdersHistory'
import { articlesRepository, type ArticlesRepository } from '../data/articles'

interface CartPageProps {
  /** Inyectable para tests. Por defecto usa el repositorio configurado por env. */
  repository?: ArticlesRepository
}

/** Pantalla `/carrito`: arriba lo que el cliente está por pedir, abajo el historial de pedidos. */
export function CartPage({ repository = articlesRepository }: CartPageProps) {
  const { count } = useCart()

  return (
    <div className="min-h-dvh bg-canvas">
      <AppHeader />

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-4 sm:py-6">
        <section aria-labelledby="cart-heading" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h1 id="cart-heading" className="text-xl font-bold text-ink">
              Tu carrito
            </h1>
            {count > 0 && (
              <span className="text-sm text-ink-soft">
                {count} {count === 1 ? 'unidad' : 'unidades'}
              </span>
            )}
          </div>
          <CartItems />
        </section>

        <section aria-labelledby="orders-heading" className="space-y-3">
          <h2 id="orders-heading" className="text-xl font-bold text-ink">
            Historial de pedidos
          </h2>
          <OrdersHistory repository={repository} />
        </section>
      </main>
    </div>
  )
}
