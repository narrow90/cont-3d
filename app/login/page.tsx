'use client'

import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

export default function Login(){
  const { signIn, signUp } = useAuth()
  const [mode,setMode] = useState<'login'|'signup'>('login')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)

  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setMessage('')
    const error = mode === 'login' ? await signIn(email,password) : await signUp(email,password)
    setBusy(false)
    if (error) setMessage(error)
    else if (mode === 'signup') setMessage('Account creato. Se ricevi una mail di conferma, aprila e poi torna qui per accedere.')
  }

  return <div className="login-card-wrap">
    <div className="login-brand"><Image src="/logo.png" width={72} height={72} alt="Made 3D Studio"/><div><strong>Made 3D Studio</strong><span>Contabilità privata</span></div></div>
    <div className="card login-card">
      <div className="type-switch login-switch"><button className={mode==='login'?'active income':''} type="button" onClick={()=>setMode('login')}>Accedi</button><button className={mode==='signup'?'active income':''} type="button" onClick={()=>setMode('signup')}>Primo accesso</button></div>
      <form onSubmit={submit} className="form" style={{gridTemplateColumns:'1fr'}}>
        <div className="field"><label>Email</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nome@gmail.com" autoComplete="email"/></div>
        <div className="field"><label>Password</label><input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimo 8 caratteri" autoComplete={mode==='login'?'current-password':'new-password'}/></div>
        {message && <div className="auth-message">{message}</div>}
        <button className="btn" disabled={busy}>{busy ? 'Attendi…' : mode==='login' ? 'Accedi' : 'Crea account'}</button>
      </form>
      <p className="login-note">Contabilità V 1.0</p>
    </div>
  </div>
}
