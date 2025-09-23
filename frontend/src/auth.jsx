import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('role') || '')
  const [phone, setPhone] = useState(() => localStorage.getItem('phone') || '')

  useEffect(() => {
    if (role) localStorage.setItem('role', role); else localStorage.removeItem('role')
  }, [role])
  useEffect(() => {
    if (phone) localStorage.setItem('phone', phone); else localStorage.removeItem('phone')
  }, [phone])

  const value = useMemo(() => ({ role, setRole, phone, setPhone }), [role, phone])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
} 