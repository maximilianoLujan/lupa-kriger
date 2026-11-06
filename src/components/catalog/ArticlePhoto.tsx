import { useState } from 'react'
import logo from '../../assets/logo.jpg'
import { PhotoLightbox } from './PhotoLightbox'

interface ArticlePhotoProps {
  /** Miniatura para la card. */
  src?: string
  /** Foto en tamaño completo para el visor. Si falta, se abre la misma `src`. */
  fullSrc?: string
  alt: string
  className?: string
}

const FRAME = 'flex items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-line'

/**
 * Foto del artículo. Si no hay URL o la imagen falla, muestra el logo del cliente.
 * Con foto real, tocarla la abre en grande (`PhotoLightbox`).
 */
export function ArticlePhoto({ src, fullSrc, alt, className = '' }: ArticlePhotoProps) {
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const showLogo = !src || failed

  if (showLogo) {
    return (
      <div className={`${FRAME} ${className}`}>
        <img src={logo} alt={alt} loading="lazy" className="h-full w-full object-contain p-2 opacity-80" />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ver foto de ${alt} en grande`}
        className={`${FRAME} cursor-zoom-in transition hover:ring-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${className}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      </button>
      {open && <PhotoLightbox src={fullSrc ?? src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  )
}
