'use client'

import { useMemo, useState } from 'react'
import { useAccounting } from '@/components/AccountingProvider'
import { money, Tipo } from '@/lib/accounting'

type Periodo = 'tutto' | 'oggi' | 'settimana' | 'mese' | 'anno' | 'personalizzato'

function csvEscape(value: string | number) {
  const text = String(value).replace(/"/g, '""')
  return `"${text}"`
}

function toLocalISO(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function periodRange(periodo: Periodo) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (periodo === 'oggi') return { from: toLocalISO(today), to: toLocalISO(today) }
  if (periodo === 'settimana') {
    const mondayOffset = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - mondayOffset)
    return { from: toLocalISO(monday), to: toLocalISO(today) }
  }
  if (periodo === 'mese') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: toLocalISO(first), to: toLocalISO(today) }
  }
  if (periodo === 'anno') {
    const first = new Date(today.getFullYear(), 0, 1)
    return { from: toLocalISO(first), to: toLocalISO(today) }
  }
  return { from: '', to: '' }
}

export default function ReportScreen(){
  const { movements, categories: dbCategories, members } = useAccounting()
  const [periodo, setPeriodo] = useState<Periodo>('mese')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [tipo, setTipo] = useState<'tutti' | Tipo>('tutti')
  const [categoria, setCategoria] = useState('tutte')
  const [utente, setUtente] = useState('tutti')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const categories = Array.from(new Set(dbCategories.filter(c => tipo === 'tutti' || c.type === tipo).map(c => c.name)))
  const automaticRange = useMemo(() => periodRange(periodo), [periodo])
  const activeFrom = periodo === 'personalizzato' ? from : automaticRange.from
  const activeTo = periodo === 'personalizzato' ? to : automaticRange.to

  const filtered = useMemo(() => movements.filter(m => {
    if (activeFrom && m.data < activeFrom) return false
    if (activeTo && m.data > activeTo) return false
    if (tipo !== 'tutti' && m.tipo !== tipo) return false
    if (categoria !== 'tutte' && m.categoria !== categoria) return false
    if (utente !== 'tutti' && m.utente !== utente) return false
    return true
  }), [movements, activeFrom, activeTo, tipo, categoria, utente])

  const totals = useMemo(() => filtered.reduce((acc,m) => {
    if (m.tipo === 'entrata') acc.entrate += m.importo
    else acc.uscite += m.importo
    return acc
  }, {entrate:0, uscite:0}), [filtered])

  const activeFilterCount = [tipo !== 'tutti', categoria !== 'tutte', utente !== 'tutti', periodo !== 'mese'].filter(Boolean).length

  function resetFilters(){
    setPeriodo('mese')
    setFrom('')
    setTo('')
    setTipo('tutti')
    setCategoria('tutte')
    setUtente('tutti')
  }

  function exportCsv(){
    const rows = [['Data','Tipo','Categoria','Utente','Cliente/Fornitore','Descrizione','Importo'], ...filtered.map(m => [m.data,m.tipo,m.categoria,m.utente,m.controparte || '',m.descrizione,m.importo.toFixed(2)])]
    const csv = '\ufeff' + rows.map(row => row.map(csvEscape).join(';')).join('\n')
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `report-contabilita-${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return <>
    <div className="top"><div><div className="eyebrow">Analisi</div><h1>Report</h1><div className="subtitle">Filtra i movimenti e scarica il risultato in CSV.</div></div><button className="btn secondary" onClick={exportCsv} disabled={!filtered.length}>Esporta CSV</button></div>

    <div className="card report-filter-card">
      <button className="report-filter-toggle" type="button" onClick={()=>setFiltersOpen(v=>!v)} aria-expanded={filtersOpen}>
        <span><strong>Filtri</strong>{activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}</span>
        <span className="filter-toggle-label">{filtersOpen ? 'Chiudi' : 'Modifica'} <span aria-hidden="true">⌄</span></span>
      </button>

      <div className={`report-filter-body ${filtersOpen ? 'open' : ''}`}>
        <div className="report-select-grid">
          <label className="report-select-field"><span>Periodo</span><select aria-label="Periodo" value={periodo} onChange={e=>setPeriodo(e.target.value as Periodo)}><option value="oggi">Oggi</option><option value="settimana">Questa settimana</option><option value="mese">Questo mese</option><option value="anno">Questo anno</option><option value="tutto">Tutto</option><option value="personalizzato">Personalizzato</option></select></label>
          <label className="report-select-field"><span>Tipo</span><select aria-label="Tipo" value={tipo} onChange={e=>{setTipo(e.target.value as 'tutti'|Tipo); setCategoria('tutte')}}><option value="tutti">Tutti</option><option value="entrata">Entrate</option><option value="uscita">Uscite</option></select></label>
          <label className="report-select-field"><span>Categoria</span><select aria-label="Categoria" value={categoria} onChange={e=>setCategoria(e.target.value)}><option value="tutte">Tutte</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
          <label className="report-select-field"><span>Utente</span><select aria-label="Utente" value={utente} onChange={e=>setUtente(e.target.value)}><option value="tutti">Tutti</option>{members.map(u=><option key={u.id} value={u.name}>{u.name}</option>)}</select></label>
        </div>

        {periodo === 'personalizzato' && <div className="custom-date-grid">
          <label className="report-select-field"><span>Dal</span><input type="date" aria-label="Data inizio" value={from} onChange={e=>setFrom(e.target.value)}/></label>
          <label className="report-select-field"><span>Al</span><input type="date" aria-label="Data fine" value={to} onChange={e=>setTo(e.target.value)}/></label>
        </div>}

        <div className="report-filter-actions"><button type="button" className="text-action" onClick={resetFilters}>Azzera filtri</button></div>
      </div>

      <div className="report-current-filter">
        <span>{periodo === 'oggi' ? 'Oggi' : periodo === 'settimana' ? 'Questa settimana' : periodo === 'mese' ? 'Questo mese' : periodo === 'anno' ? 'Questo anno' : periodo === 'tutto' ? 'Tutto il periodo' : 'Periodo personalizzato'}</span>
        <span>•</span><span>{tipo === 'tutti' ? 'Entrate + Uscite' : tipo === 'entrata' ? 'Entrate' : 'Uscite'}</span>
        {categoria !== 'tutte' && <><span>•</span><span>{categoria}</span></>}
        {utente !== 'tutti' && <><span>•</span><span>{utente}</span></>}
      </div>

      <div className="grid report-summary">
        <div><strong>Entrate</strong><div className="value positive">{money(totals.entrate)}</div></div>
        <div><strong>Uscite</strong><div className="value negative">{money(totals.uscite)}</div></div>
        <div><strong>Saldo</strong><div className={`value ${totals.entrate-totals.uscite < 0 ? 'negative' : 'positive'}`}>{money(totals.entrate-totals.uscite)}</div></div>
      </div>
    </div>

    <div className="card report-results">
      <div className="archive-head"><div><div className="section-kicker">Risultati</div><h2>{filtered.length} movimenti</h2></div></div>
      {filtered.length === 0 ? <div className="empty-state"><p>Nessun movimento corrisponde ai filtri.</p></div> : <div className="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Utente</th><th>Descrizione</th><th>Importo</th></tr></thead><tbody>{filtered.map(m=><tr key={m.id}><td>{new Date(`${m.data}T12:00:00`).toLocaleDateString('it-IT')}</td><td>{m.tipo}</td><td>{m.categoria}</td><td>{m.utente}</td><td>{m.descrizione}</td><td className={m.tipo==='entrata'?'positive':'negative'}>{m.tipo==='entrata'?'+':'−'}{money(m.importo)}</td></tr>)}</tbody></table></div>}
    </div>
  </>
}
