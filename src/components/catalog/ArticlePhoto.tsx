import { useState } from 'react'
import logo from '../../assets/logo.jpg'

interface ArticlePhotoProps {
  src?: string
  alt: string
  className?: string
}

/** Foto del artículo. Si no hay URL o la imagen falla, muestra el logo del cliente. */
export function ArticlePhoto({ src, alt, className = '' }: ArticlePhotoProps) {
  const [failed, setFailed] = useState(false)
  const showLogo = !src || failed

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-line ${className}`}
    >
      <img
        src={showLogo ? logo : src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={showLogo ? 'h-full w-full object-contain p-2 opacity-80' : 'h-full w-full object-contain'}
      />
    </div>
  )
}
