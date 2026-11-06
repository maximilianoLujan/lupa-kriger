/**
 * Gestor de contraseñas del navegador (Credential Management API).
 *
 * Tras un login exitoso le pedimos al navegador que guarde usuario y contraseña: Chrome y Edge muestran su
 * diálogo "¿Guardar contraseña?" y después autocompletan el formulario. La API no existe en Firefox ni Safari,
 * que igual detectan el formulario solos por `autocomplete="username"` / `"current-password"`.
 */

interface PasswordCredentialData {
  id: string
  password: string
  name?: string
}

type PasswordCredentialCtor = new (data: PasswordCredentialData) => Credential

function passwordCredentialCtor(): PasswordCredentialCtor | undefined {
  if (typeof window === 'undefined' || !('credentials' in navigator)) return undefined
  return (window as unknown as { PasswordCredential?: PasswordCredentialCtor }).PasswordCredential
}

/** Devuelve true si este navegador puede guardar credenciales por API. */
export function canStoreCredentials(): boolean {
  return passwordCredentialCtor() !== undefined
}

/**
 * Pide al navegador guardar las credenciales. Nunca lanza: si el usuario rechaza o la API falla,
 * el login ya se hizo y no hay nada que corregir.
 */
export async function storeCredentials(username: string, password: string, name?: string): Promise<void> {
  const Ctor = passwordCredentialCtor()
  if (!Ctor || !username || !password) return
  try {
    await navigator.credentials.store(new Ctor({ id: username, password, name }))
  } catch {
    // El usuario cerró el diálogo o el navegador no lo permite en este contexto (p. ej. sin HTTPS).
  }
}
