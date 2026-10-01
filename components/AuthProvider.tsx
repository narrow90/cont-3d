'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const ALLOWED = new Set([
  'alexsenatores@gmail.com',
  'andrea.damatodj@gmail.com',
  'diego.derosa2001@gmail.com',
])

type AuthContextValue = {
  user: User | null
  loading: boolean
  allowed: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    if (!ALLOWED.has(normalized)) return 'Email non autorizzata.'
    const { error } = await supabase.auth.signInWithPassword({ email: normalized, password })
    return error?.message ?? null
  }, [supabase])

  const signUp = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    if (!ALLOWED.has(normalized)) return 'Email non autorizzata.'
    const { error } = await supabase.auth.signUp({ email: normalized, password })
    return error?.message ?? null
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const allowed = !!user?.email && ALLOWED.has(user.email.toLowerCase())
  const value = useMemo(() => ({ user, loading, allowed, signIn, signUp, signOut }), [user, loading, allowed, signIn, signUp, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth deve essere usato dentro AuthProvider')
  return value
}
