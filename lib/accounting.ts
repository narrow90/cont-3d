export type Tipo = 'entrata' | 'uscita'

export type Movimento = {
  id: string
  tipo: Tipo
  categoria: string
  categoriaId: string
  importo: number
  data: string
  utente: string
  utenteId: string
  descrizione: string
  metodo: 'Contanti'
  controparte?: string
  allegato?: {
    nome: string
    tipo?: string
    path: string
    url?: string
  }
  createdAt: string
}

export type TeamMember = { id: string; name: string; email: string }
export type Category = { id: string; name: string; type: Tipo }

export const ENTRATE = ['Pagamento Contanti', 'Versamento', 'Altro']
export const USCITE = ['Filamenti', 'Stipendi', 'Acquisti online', 'Trasferta', 'Versamento']
export const UTENTI = ['Diego', 'Andrea', 'Talpone']
export const METODO_PAGAMENTO = 'Contanti' as const

export function money(value: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}

export function parseLocalDate(date: string) {
  return new Date(`${date}T12:00:00`)
}
