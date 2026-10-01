'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAccounting } from '@/components/AccountingProvider'
import { money, parseLocalDate, type Tipo } from '@/lib/accounting'

function iconFor(category: string) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (category === 'Filamenti') return <svg {...common}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5"/><path d="M20 12h-5"/></svg>
  if (category === 'Stipendi') return <svg {...common}><path d="M3 7h18v12H3z"/><path d="M7 7V5h10v2"/><path d="M8 13h8"/></svg>
  if (category === 'Acquisti online') return <svg {...common}><path d="M3 4h2l2 11h10l2-7H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>
  if (category === 'Trasferta') return <svg {...common}><path d="M4 17h16"/><path d="M6 17l2-7h8l2 7"/><path d="M9 10V7h6v3"/></svg>
  if (category === 'Pagamento Contanti') return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M7 9h.01M17 15h.01"/></svg>
  return <svg {...common}><path d="M12 3v18"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg>
}

export default function MovementsScreen() {
  const { movements, members, categories, addMovement, deleteMovement, hydrated } = useAccounting()
  const [tipo, setTipo] = useState<Tipo>('uscita')
  const [importo, setImporto] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [utenteId, setUtenteId] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [cliente, setCliente] = useState('')
  const [allegato, setAllegato] = useState<File | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filter, setFilter] = useState<'tutti' | Tipo>('tutti')
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const filteredCategories = useMemo(() => categories.filter(c => c.type === tipo), [categories, tipo])
  useEffect(() => { if (!categoriaId || !filteredCategories.some(c=>c.id===categoriaId)) setCategoriaId(filteredCategories[0]?.id ?? '') }, [filteredCategories, categoriaId])
  useEffect(() => { if (!utenteId && members.length) setUtenteId(members[0].id) }, [members, utenteId])

  function changeTipo(next: Tipo) { setTipo(next); setCategoriaId('') }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const parsed = Number(importo.replace(',', '.'))
    if (!parsed || parsed <= 0 || !categoriaId || !utenteId) return
    setSaving(true); setMessage('')
    const categoryName = categories.find(c=>c.id===categoriaId)?.name ?? ''
    const error = await addMovement({
      tipo, categoriaId, importo: parsed, data, utenteId,
      descrizione: descrizione.trim() || cliente.trim() || categoryName,
      controparte: cliente.trim() || undefined, allegato,
    })
    setSaving(false)
    if (error) { setMessage(error); return }
    setImporto(''); setDescrizione(''); setCliente(''); setAllegato(null); setShowDetails(false)
    setMessage('Movimento salvato.')
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return movements.filter(m => (filter === 'tutti' || m.tipo === filter) && (!q || [m.categoria, m.descrizione, m.utente, m.controparte || ''].some(v => v.toLowerCase().includes(q))))
  }, [movements, filter, query])

  async function remove(id:string){
    if (!confirm('Eliminare questo movimento?')) return
    const error = await deleteMovement(id)
    if (error) alert(error)
  }

  return <>
    <div className="movements-heading">
      <div><div className="eyebrow">Gestione movimenti</div><h1>Entrate e uscite</h1><div className="subtitle">Dati condivisi e salvati online su Supabase.</div></div>
    </div>

    <section className="movement-composer">
      <div className="type-switch" role="group" aria-label="Tipo movimento">
        <button type="button" onClick={() => changeTipo('uscita')} className={tipo === 'uscita' ? 'active expense' : ''}><span className="switch-icon">−</span><span>Uscita</span></button>
        <button type="button" onClick={() => changeTipo('entrata')} className={tipo === 'entrata' ? 'active income' : ''}><span className="switch-icon">+</span><span>Entrata</span></button>
      </div>

      <form onSubmit={submit} className="quick-movement-form">
        <div className="amount-block"><label htmlFor="amount">Importo</label><div className="amount-input"><span>€</span><input id="amount" value={importo} onChange={e => setImporto(e.target.value)} inputMode="decimal" placeholder="0,00" required/></div></div>
        <div className="quick-grid">
          <div className="field"><label>Categoria</label><select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required>{filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="field"><label>Data</label><input type="date" value={data} onChange={e => setData(e.target.value)} required/></div>
          <div className="field"><label>Utente</label><select value={utenteId} onChange={e => setUtenteId(e.target.value)} required>{members.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
        </div>
        <button type="button" className="details-toggle" onClick={() => setShowDetails(v => !v)} aria-expanded={showDetails}><span>{showDetails ? 'Nascondi dettagli' : 'Aggiungi dettagli'}</span><span className={showDetails ? 'rotated' : ''}>⌄</span></button>
        {showDetails && <div className="movement-details">
          <div className="field"><label>Cliente / Fornitore</label><input value={cliente} onChange={e=>setCliente(e.target.value)} placeholder="Facoltativo"/></div>
          <div className="field full"><label>Descrizione</label><textarea rows={3} value={descrizione} onChange={e=>setDescrizione(e.target.value)} placeholder="Aggiungi una nota..."/></div>
          <div className="field full"><label>Foto / documento</label><label className="upload-box"><span className="upload-icon">＋</span><span><strong>{allegato ? allegato.name : 'Aggiungi allegato'}</strong><small>{allegato ? `${Math.round(allegato.size/1024)} KB` : 'Foto, ricevuta o PDF'}</small></span><input type="file" accept="image/*,.pdf" capture="environment" onChange={e => setAllegato(e.target.files?.[0] || null)}/></label></div>
        </div>}
        {message && <div className="auth-message">{message}</div>}
        <button className={`save-movement ${tipo}`} type="submit" disabled={saving || !hydrated}><span>{tipo === 'uscita' ? '−' : '+'}</span> {saving ? 'Salvataggio…' : `Salva ${tipo}`}</button>
      </form>
    </section>

    <section className="movement-archive">
      <div className="archive-head"><div><div className="section-kicker">Archivio</div><h2>Movimenti recenti</h2></div><span className="movement-count">{movements.length}</span></div>
      <div className="movement-tools">
        <div className="filter-pills"><button className={filter === 'tutti' ? 'active' : ''} onClick={() => setFilter('tutti')}>Tutti</button><button className={filter === 'uscita' ? 'active' : ''} onClick={() => setFilter('uscita')}>Uscite</button><button className={filter === 'entrata' ? 'active' : ''} onClick={() => setFilter('entrata')}>Entrate</button></div>
        <div className="movement-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca movimento"/></div>
      </div>
      {visible.length === 0 ? <div className="movement-empty"><div className="empty-icon">↕</div><strong>{movements.length === 0 ? 'Nessun movimento' : 'Nessun risultato'}</strong><p>{movements.length === 0 ? 'Il primo movimento comparirà qui e aggiornerà dashboard, grafico e report.' : 'Prova a cambiare filtro o ricerca.'}</p></div> : <div className="movement-list">
        {visible.map(m => <article className="movement-row" key={m.id}>
          <div className={`movement-category-icon ${m.tipo}`}>{iconFor(m.categoria)}</div>
          <div className="movement-row-main">
            <div className="movement-row-top"><strong>{m.categoria}</strong><span className={`movement-price ${m.tipo}`}>{m.tipo === 'uscita' ? '−' : '+'}{money(m.importo)}</span></div>
            <div className="movement-meta"><span>{m.descrizione}</span><span>•</span><span>{m.utente}</span></div>
            <div className="movement-meta secondary"><span>{parseLocalDate(m.data).toLocaleDateString('it-IT', {day:'2-digit', month:'short'})}</span>{m.allegato?.url && <><span>•</span><a href={m.allegato.url} target="_blank" rel="noreferrer">Allegato</a></>}</div>
          </div>
          <button className="movement-more delete-action" type="button" aria-label="Elimina movimento" onClick={() => remove(m.id)}>×</button>
        </article>)}
      </div>}
    </section>
  </>
}
