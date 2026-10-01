'use client'
import { useAuth } from '@/components/AuthProvider'
export default function Profilo(){
  const { user, signOut } = useAuth()
  return <><div className="top"><div><div className="eyebrow">Account</div><h1>Profilo</h1><div className="subtitle">Utente amministratore</div></div></div><div className="card" style={{maxWidth:600}}><div className="profile-email">{user?.email}</div><p>Tutti e tre gli utenti autorizzati possono inserire, modificare ed eliminare i dati condivisi.</p><button className="btn secondary" onClick={signOut}>Esci</button></div></>
}
