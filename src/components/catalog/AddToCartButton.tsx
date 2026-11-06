import { useCart } from '../../cart/useCart'
import type { AlternativeArticle } from '../../types/article'

interface AddToCartButtonProps {
  article: AlternativeArticle
}

/** Botón redondo "agregar al carrito". Si ya está en el carrito muestra la cantidad. */
export function AddToCartButton({ article }: AddToCartButtonProps) {
  const { items, add } = useCart()
  const inCart = items.find((i) => i.article.articleCode === article.articleCode)?.quantity ?? 0

  return (
    <button
      type="button"
      onClick={() => add(article)}
      aria-label={`Agregar ${article.brandName} ${article.particularCode} al carrito`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95 focus-visible:ring-4 focus-visible:ring-brand/40 focus-visible:outline-none ${
        inCart ? 'bg-brand text-brand-text' : 'bg-brand-soft text-brand-text hover:bg-brand'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M2 3h3l2.5 11h11L21 7H6.2" />
        <path d="M12 8v4M10 10h4" />
      </svg>
      {inCart > 0 && (
        <span
          aria-label={`${inCart} en el carrito`}
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand-text ring-2 ring-brand"
        >
          {inCart}
        </span>
      )}
    </button>
  )
}
