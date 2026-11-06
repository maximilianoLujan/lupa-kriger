import type { User } from '../types/user'

// Credenciales mock para el MVP. Reemplazar por llamada a API.
const MOCK_USERS: Array<{ username: string; password: string; name: string }> = [
  { username: '123', password: '123', name: 'Gabriel Kriger' },
]

export function authenticate(username: string, password: string): User | null {
  const match = MOCK_USERS.find(
    (u) => u.username === username.trim() && u.password === password,
  )
  return match ? { username: match.username, name: match.name } : null
}
