import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/useAuth'
import { QueryProvider } from './lib/QueryProvider'
import { CartPage } from './pages/CartPage'
import { CatalogPage } from './pages/CatalogPage'
import { LoginPage } from './pages/LoginPage'

/** Sin sesión, cualquier ruta muestra el login. Con sesión, las pantallas de la app. */
export function AppRoutes() {
  const { user } = useAuth()
  if (!user) return <LoginPage />
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/carrito" element={<CartPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  )
}
