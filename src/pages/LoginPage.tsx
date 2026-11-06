import { useState, type FormEvent } from 'react'
import { storeCredentials } from '../auth/credentialManager'
import { useAuth } from '../auth/useAuth'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const YEAR = new Date().getFullYear()

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    // Si estaba visible, vuelve a type="password": así el navegador reconoce el campo al guardar.
    setShowPassword(false)
    setLoading(true)
    const ok = await login(username, password)
    if (!ok) {
      setLoading(false)
      setError('Usuario o contraseña incorrectos.')
      return
    }
    // Login correcto: el navegador ofrece guardar las credenciales (Chrome/Edge). La página cambia sola al catálogo.
    await storeCredentials(username.trim(), password)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:flex-row">
      {/* Panel de marca: franja arriba en mobile, columna izquierda en desktop */}
      <aside className="relative overflow-hidden bg-brand px-6 pt-10 pb-16 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:gap-14 lg:px-16 lg:py-14">
        {/* Franjas diagonales como las del logo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-60deg, #fff 0 14px, transparent 14px 40px)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl lg:h-[28rem] lg:w-[28rem]"
        />

        <div className="relative mx-auto w-full max-w-xs rounded-2xl bg-white p-4 shadow-2xl shadow-brand-hover/40 lg:mx-0 lg:max-w-sm lg:p-6">
          <Logo />
        </div>

        <div className="relative mt-8 lg:mt-0">
          <p className="text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">
            Catálogo de repuestos
          </p>
          <h1 className="mt-2 text-2xl leading-tight font-bold lg:text-4xl">
            Encontrá el repuesto que buscás, al instante.
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/80 lg:text-base">
            Buscá por marca, modelo o código. Stock y precios siempre actualizados.
          </p>
        </div>
      </aside>

      {/* Formulario: card superpuesta en mobile, columna derecha en desktop */}
      <main className="relative z-10 -mt-8 flex flex-1 items-start justify-center px-4 pb-10 lg:mt-0 lg:items-center lg:px-16">
        <form
          onSubmit={handleSubmit}
          noValidate
          className={`w-full max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-ink/10 sm:p-8 ${
            error ? 'animate-shake' : ''
          }`}
        >
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Ingresar</h2>
          <p className="mt-1 text-sm text-ink-soft">Usá tu usuario y contraseña para continuar.</p>

          <div className="mt-6 space-y-4">
            <Input
              label="Usuario"
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              invalid={!!error}
              required
              autoFocus
            />
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={!!error}
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="rounded-lg p-1.5 text-ink-soft transition hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-text"
            >
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="mt-6">
            {loading ? 'Ingresando…' : 'Ingresar'}
          </Button>

          <p className="mt-6 text-center text-xs text-ink-soft">
            © {YEAR} Repuestos Guatrache · Gabriel Kriger
          </p>
        </form>
      </main>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17.94 17.94A10.4 10.4 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="m2 2 20 20" />
    </svg>
  )
}
