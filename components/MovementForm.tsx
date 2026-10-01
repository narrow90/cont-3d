'use client'
import { useMemo, useState } from 'react'

const entrate=['Pagamento Contanti','Versamento','Altro']
const uscite=['Filamenti','Stipendi','Acquisti online','Trasferta','Versamento']

export default function MovementForm(){
 const [tipo,setTipo]=useState<'entrata'|'uscita'>('uscita')
 const categorie=useMemo(()=>tipo==='entrata'?entrate:uscite,[tipo])
 return <form className="card form">
   <div className="field"><label>Tipo</label><select value={tipo} onChange={e=>setTipo(e.target.value as 'entrata'|'uscita')}><option value="entrata">Entrata</option><option value="uscita">Uscita</option></select></div>
   <div className="field"><label>Categoria</label><select>{categorie.map(c=><option key={c}>{c}</option>)}</select></div>
   <div className="field"><label>Importo</label><input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0,00 €"/></div>
   <div className="field"><label>Data</label><input type="date"/></div>
   <div className="field"><label>Utente</label><select><option>Diego</option><option>Andrea</option><option>Talpone</option></select></div>
   <div className="field full"><label>Cliente / Fornitore</label><input placeholder="Facoltativo" autoComplete="off"/></div>
   <div className="field full"><label>Descrizione</label><textarea rows={3} placeholder="Note sul movimento"/></div>
   <div className="field full"><label>Allegato</label><input type="file" accept="image/*,.pdf" capture="environment"/></div>
   <div className="field full"><button className="btn" type="button">Salva movimento</button></div>
 </form>
}
