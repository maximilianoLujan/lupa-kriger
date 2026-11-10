import { useEffect, useId, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS, type NavItem } from './navItems'

interface SectionsMenuProps {
  items?: NavItem[]
}

/**
 * Menú desplegable con las secciones de la app, a la derecha del header.
 * Las disponibles navegan; las que todavía no existen se ven en neutro con la etiqueta "Próximamente".
 * Se cierra con Escape, al tocar afuera o al elegir una sección.
 */
export function SectionsMenu({ items = NAV_ITEMS }: SectionsMenuProps) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!container.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-label="Secciones"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 transition ${
          open ? 'bg-brand text-white ring-brand' : 'bg-canvas text-ink ring-line hover:ring-brand'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          aria-label="Secciones"
          className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-line"
        >
          {items.map((item) => (
            <li key={item.key} role="none">
              {item.to ? (
                <NavLink
                  to={item.to}
                  end
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex h-11 items-center gap-3 rounded-xl px-2 text-sm font-semibold transition ${
                      isActive ? 'bg-brand text-white' : 'text-ink hover:bg-canvas'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${
                          isActive ? 'bg-white/20' : 'bg-canvas text-ink-soft ring-1 ring-line'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ) : (
                <span
                  role="menuitem"
                  aria-disabled="true"
                  className="flex h-11 cursor-default items-center gap-3 rounded-xl px-2 text-sm font-medium text-ink-soft"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas ring-1 ring-line">
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <span className="flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1 ring-line">
                    <LockIcon />
                    Próximamente
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}
