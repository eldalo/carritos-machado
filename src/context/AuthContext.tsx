import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

const SESSION_KEY = 'cm_session'

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: string
}

export type LoginResult =
  | { success: true; error?: undefined }
  | { success: false; error: string }

interface AuthContextValue {
  user: User | null
  login: (username: string, password: string) => Promise<LoginResult>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredSession(): User | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) return JSON.parse(stored) as User
  } catch {
    localStorage.removeItem(SESSION_KEY)
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredSession())

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const { data, error } = await supabase.rpc('authenticate_user', {
      p_username: username,
      p_password: password,
    })

    if (error) {
      return { success: false, error: 'Error de conexión. Intenta de nuevo.' }
    }

    const result = data as { success: boolean; user?: User; error?: string }

    if (!result.success) {
      return { success: false, error: result.error || 'Usuario o contraseña incorrectos' }
    }

    const authenticatedUser = result.user!
    setUser(authenticatedUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser))
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
