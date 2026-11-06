import { useState } from 'react'
import { NAV_ITEMS, type NavItem } from './navItems'

interface NavBarProps {
  items?: NavItem[]
  current?: string
}

/**
 * Chips de navegación. Un solo acento (rosa de marca) para la sección activa;
 * los bloqueados van en neutro con candado y muestran "Próximamente"
 * al pasar el mouse, enfocar o tocar en celular.
 */
export function NavBar({ items = NAV_ITEMS, current = 'catalogo' }: NavBarProps) {
  return (
    <nav aria-label="Secciones">
      {/* El scroll horizontal también recorta en vertical: el padding deja lugar al anillo y la sombra de los chips. */}
      <ul className="-mx-4 -my-1.5 flex gap-2 overflow-x-auto px-4 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) =>
          item.locked ? (
            <LockedChip key={item.key} item={item} />
          ) : (
            <li key={item.key} className="shrink-0">
              <a
                href="#"
                aria-current={item.key === current ? 'page' : undefined}
                onClick={(e) => e.preventDefault()}
                className="flex h-10 items-center gap-2 rounded-full bg-brand pr-4 pl-1.5 text-sm font-semibold text-white shadow-sm shadow-brand/30"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}

function LockedChip({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false)
  const tooltipId = `tip-${item.key}`

  return (
    <li className="group shrink-0">
      <button
        type="button"
        aria-label={item.label}
        aria-disabled="true"
        aria-describedby={tooltipId}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="relative flex h-10 cursor-help items-center gap-2 overflow-hidden rounded-full bg-white pr-3 pl-1.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-ink-soft ring-1 ring-line">
          {item.icon}
        </span>
        {item.label}
        <LockIcon />
        {/* Se superpone al chip al pasar el mouse, enfocar o tocar: así no lo recorta el scroll horizontal. */}
        <span
          id={tooltipId}
          role="tooltip"
          data-open={open || undefined}
          className={`pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 rounded-full bg-brand text-xs font-semibold text-white transition group-hover:opacity-100 group-focus-within:opacity-100 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <LockIcon />
          Próximamente
        </span>
      </button>
    </li>
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
      className="h-3.5 w-3.5 opacity-70"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}
