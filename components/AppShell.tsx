'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DesktopNav, MobileNav } from '@/components/AppNav'
import { useAuth } from '@/components/AuthProvider'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, allowed } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const onLogin = pathname.startsWith('/login')

  useEffect(() => {
    if (loading) return
    if ((!user || !allowed) && !onLogin) router.replace('/login')
    if (user && allowed && onLogin) router.replace('/dashboard')
  }, [user, allowed, loading, onLogin, router])

  if (loading) return <div className="auth-loading">Caricamento…</div>
  if ((!user || !allowed) && !onLogin) return <div className="auth-loading">Accesso richiesto…</div>
  if (onLogin) return <main className="login-page">{children}</main>

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">
        <Image className="brand-logo" src="/logo.png" alt="Made 3D Studio" width={50} height={50} priority />
        <div className="brand-copy"><strong>Made 3D Studio</strong><span>Contabilità</span></div>
      </div>
      <DesktopNav />
      <div className="sidebar-footer">Gestione interna<br/>Entrate · Uscite · Report</div>
    </aside>
    <main className="content">
      <header className="mobile-header">
        <div className="mobile-brand"><Image src="/logo.png" alt="Made 3D Studio" width={44} height={44} priority /><div><strong>Made 3D</strong><span>Contabilità</span></div></div>
        <div className="avatar" aria-label="Profilo">{user?.email?.slice(0,2).toUpperCase()}</div>
      </header>
      {children}
    </main>
    <MobileNav />
  </div>
}
