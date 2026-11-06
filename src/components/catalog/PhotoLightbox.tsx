import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface PhotoLightboxProps {
  src: string
  alt: string
  onClose: () => void
}

/**
 * Foto en grande sobre toda la pantalla. Se cierra con Escape, con el botón o tocando fuera de la imagen.
 * Va en un portal al body para que ningún contenedor la recorte.
 */
export function PhotoLightbox({ src, alt, onClose }: PhotoLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  // Ref para no reabrir el efecto (ni devolver el foco) cada vez que el padre re-renderiza.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto de ${alt}`}
      // Solo cierra si el toque cae en el fondo: ni en la imagen ni en el botón (que ya cierra por su cuenta).
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
    >
      <button
        ref={closeRef}
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-md ring-1 ring-line transition hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
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
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <img
        src={src}
        alt={alt}
        className="max-h-[85dvh] max-w-full rounded-2xl bg-white object-contain shadow-xl"
      />
    </div>,
    document.body,
  )
}
