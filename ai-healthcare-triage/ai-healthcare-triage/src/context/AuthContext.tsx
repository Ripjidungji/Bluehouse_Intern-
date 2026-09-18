import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Role, User } from '../types'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string, role?: Role) => boolean
  register: (name: string, email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type StoredAccount = { password: string; user: User }

const demoUsers: Record<string, StoredAccount> = {
  'patient@example.com': { password: 'password123', user: { id: 'u1', name: 'John Doe', email: 'patient@example.com', role: 'patient' } },
  'doctor@example.com': { password: 'password123', user: { id: 'u2', name: 'Dr. Sarah Johnson', email: 'doctor@example.com', role: 'doctor' } },
  'admin@example.com': { password: 'password123', user: { id: 'u3', name: 'System Admin', email: 'admin@example.com', role: 'admin' } }
}

function getAccounts() {
  const stored = localStorage.getItem('triage_accounts')
  if (!stored) return demoUsers

  try {
    return { ...demoUsers, ...JSON.parse(stored) as Record<string, StoredAccount> }
  } catch {
    return demoUsers
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('triage_user')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem('triage_user', JSON.stringify(user))
    else localStorage.removeItem('triage_user')
  }, [user])

  function login(email: string, password: string, role?: Role) {
    const normalizedEmail = email.trim().toLowerCase()
    const account = getAccounts()[normalizedEmail]

    if (!account || account.password !== password) return false

    if (role && account.user.role !== role) return false

    setUser(account.user)
    return true
  }

  function register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const accounts = getAccounts()
    if (accounts[normalizedEmail]) return false

    const newUser: User = { id: `u-${Date.now()}`, name: name.trim(), email: normalizedEmail, role: 'patient' }
    localStorage.setItem('triage_accounts', JSON.stringify({ ...accounts, [normalizedEmail]: { password, user: newUser } }))
    setUser(newUser)
    return true
  }

  function logout() { setUser(null) }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export function rolePath(role: Role) {
  return role === 'patient' ? '/patient' : role === 'doctor' ? '/doctor' : '/admin'
}
