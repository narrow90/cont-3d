'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import DashboardChart from '@/components/DashboardChart'
import { useAccounting } from '@/components/AccountingProvider'
import { money, parseLocalDate } from '@/lib/accounting'

export default function DashboardScreen(){
  const { movements, hydrated } = useAccounting()
  const stats = useMemo(() => {
    const now = new Date()
    let entrate = 0, uscite = 0
    movements.forEach(m => {
      const d = parseLocalDate(m.data)
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
        if (m.tipo === 'entrata') entrate += m.importo
        else uscite += m.importo
      }
    })
    return { entrate, uscite, saldo: entrate - uscite }
  }, [movements])

  const recent = movements.slice().sort((a,b) => b.data.localeCompare(a.data) || b.createdAt.localeCompare(a.createdAt)).slice(0,5)

  return <>
    <div className="top">
      <div><div className="eyebrow">Made 3D Studio</div><h1>Dashboard</h1><div className="subtitle">Dati condivisi del mese corrente, aggiornati dal database.</div></div>
      <Link className="btn" href="/movimenti">+ Nuovo movimento</Link>
    </div>

    <section className="grid">
      <div className="card metric-card"><div className="metric-label">Entrate mese</div><div className="value positive">{money(stats.entrate)}</div></div>
      <div className="card metric-card"><div className="metric-label">Uscite mese</div><div className="value negative">{money(stats.uscite)}</div></div>
      <div className="card metric-card"><div className="metric-label">Saldo</div><div className={`value ${stats.saldo < 0 ? 'negative' : stats.saldo > 0 ? 'positive' : ''}`}>{money(stats.saldo)}</div></div>
    </section>

    <section className="two">
      <div className="card"><div className="card-heading-row"><div><h2>Entrate / Uscite</h2><div className="chart-period">Mese corrente · valori giornalieri</div></div></div><DashboardChart/></div>
      <div className="card"><h2>Ultimi movimenti</h2>{!hydrated ? <div className="empty-state"><p>Caricamento…</p></div> : recent.length === 0 ? <div className="empty-state"><span className="mini-badge">Archivio</span><p>Nessun movimento inserito.</p></div> : <div className="last-movements">{recent.map(m => <div className="last-item" key={m.id}><div><strong>{m.categoria}</strong><div className="last-meta">{parseLocalDate(m.data).toLocaleDateString('it-IT')} · {m.utente}</div></div><strong className={m.tipo === 'entrata' ? 'positive' : 'negative'}>{m.tipo === 'entrata' ? '+' : '−'}{money(m.importo)}</strong></div>)}</div>}</div>
    </section>
  </>
}
