import { useState, type ReactNode } from 'react'
import type { User } from '../types/user'
import { authenticate } from './credentials'
import { AuthContext } from './context'

const STORAGE_KEY = 'auth:user'

function readStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)

  async function login(username: string, password: string) {
    // Pequeña demora para simular red y mostrar el estado de carga.
    await new Promise((r) => setTimeout(r, 500))
    const found = authenticate(username, password)
    if (!found) return false
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    setUser(found)
    return true
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
