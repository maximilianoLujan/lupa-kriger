import { createContext } from 'react'
import type { User } from '../types/user'

export interface AuthContextValue {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
