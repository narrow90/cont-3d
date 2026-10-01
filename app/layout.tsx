import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { AccountingProvider } from '@/components/AccountingProvider'
import AppShell from '@/components/AppShell'

export const metadata = {
  title: 'Made 3D Studio | Contabilità',
  description: 'Entrate, uscite e report di Made 3D Studio',
}

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="it"><body>
    <AuthProvider>
      <AccountingProvider>
        <AppShell>{children}</AppShell>
      </AccountingProvider>
    </AuthProvider>
  </body></html>
}
