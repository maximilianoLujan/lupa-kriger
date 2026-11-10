import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useCart } from '../../cart/useCart'
import { Logo } from '../Logo'
import { SectionsMenu } from './SectionsMenu'

interface AppHeaderProps {
  /** Contenido extra debajo de la fila principal (ej. la barra de búsqueda del catálogo). */
  children?: ReactNode
}

/**
 * Header fijo de todas las pantallas: logo, usuario, acceso al carrito (con cantidad),
 * menú de secciones y salir. Mobile first: el nombre del usuario aparece desde `sm`.
 */
export function AppHeader({ children }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl space-y-3 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between gap-3">
          <NavLink to="/" aria-label="Ir al catálogo" className="shrink-0">
            <Logo className="max-w-[8.5rem] sm:max-w-[10rem]" />
          </NavLink>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden items-center gap-2 rounded-full bg-canvas py-1.5 pr-4 pl-1.5 text-ink ring-1 ring-line sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                {initials(user?.name)}
              </span>
              {user?.name}
            </span>
            <NavLink
              to="/carrito"
              aria-label={count > 0 ? `Ir al carrito, ${count} unidades` : 'Ir al carrito'}
              className={({ isActive }) =>
                `relative flex h-10 w-10 items-center justify-center rounded-full transition ${
                  isActive
                    ? 'bg-white text-brand ring-2 ring-brand'
                    : 'bg-brand text-white shadow-sm shadow-brand/30 hover:bg-brand-hover'
                }`
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
                <path d="M2 3h3l2.5 11h11L21 7H6.2" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand-text ring-2 ring-brand">
                  {count}
                </span>
              )}
            </NavLink>
            <SectionsMenu />
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-canvas px-4 py-2 font-medium text-ink ring-1 ring-line transition hover:ring-brand"
            >
              Salir
            </button>
          </div>
        </div>

        {children}
      </div>
    </header>
  )
}

function initials(name?: string) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}
