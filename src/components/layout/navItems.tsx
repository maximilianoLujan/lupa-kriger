import type { ReactNode } from 'react'

export interface NavItem {
  key: string
  label: string
  icon: ReactNode
  /** Ruta a la que lleva. Sin `to`, el item está bloqueado y se muestra como "Próximamente". */
  to?: string
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'h-4 w-4',
  'aria-hidden': true,
}

const searchIcon = (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

const cartIcon = (
  <svg {...iconProps}>
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
    <path d="M2 3h3l2.5 11h11L21 7H6.2" />
  </svg>
)

const boxIcon = (
  <svg {...iconProps}>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
    <path d="M3 7.5 12 12l9-4.5M12 12v9" />
  </svg>
)

const tagIcon = (
  <svg {...iconProps}>
    <path d="M3 12V4h8l9 9-8 8-9-9Z" />
    <circle cx="7.5" cy="8.5" r="1.5" />
  </svg>
)

const heartIcon = (
  <svg {...iconProps}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </svg>
)

const carIcon = (
  <svg {...iconProps}>
    <path d="M5 16 6.5 9h11L19 16" />
    <rect x="3" y="16" width="18" height="4" rx="1" />
    <circle cx="7.5" cy="20" r="1" />
    <circle cx="16.5" cy="20" r="1" />
  </svg>
)

const receiptIcon = (
  <svg {...iconProps}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
)

/** Secciones del menú desplegable. Para habilitar una, agregale `to`. */
export const NAV_ITEMS: NavItem[] = [
  { key: 'catalogo', label: 'Catálogo', icon: searchIcon, to: '/' },
  { key: 'carrito', label: 'Carrito', icon: cartIcon, to: '/carrito' },
  { key: 'pedidos', label: 'Pedidos', icon: boxIcon },
  { key: 'ofertas', label: 'Ofertas', icon: tagIcon },
  { key: 'favoritos', label: 'Favoritos', icon: heartIcon },
  { key: 'vehiculos', label: 'Mis vehículos', icon: carIcon },
  { key: 'cuenta', label: 'Cuenta corriente', icon: receiptIcon },
]
