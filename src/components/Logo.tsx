import logo from '../assets/logo.jpg'

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <img
      src={logo}
      alt="Repuestos Guatrache de Gabriel Kriger"
      className={`h-auto w-full object-contain ${className}`}
      draggable={false}
    />
  )
}
