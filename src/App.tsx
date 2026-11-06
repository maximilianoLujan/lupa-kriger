import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/useAuth'
import { CatalogPage } from './pages/CatalogPage'
import { LoginPage } from './pages/LoginPage'

function Routes() {
  const { user } = useAuth()
  return user ? <CatalogPage /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}
