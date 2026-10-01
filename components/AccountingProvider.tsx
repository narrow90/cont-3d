'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { METODO_PAGAMENTO, type Category, type Movimento, type TeamMember, type Tipo } from '@/lib/accounting'
import { useAuth } from '@/components/AuthProvider'

type NewMovement = {
  tipo: Tipo
  categoriaId: string
  importo: number
  data: string
  utenteId: string
  descrizione: string
  controparte?: string
  allegato?: File | null
}

type AccountingContextValue = {
  movements: Movimento[]
  members: TeamMember[]
  categories: Category[]
  hydrated: boolean
  addMovement: (movement: NewMovement) => Promise<string | null>
  deleteMovement: (id: string) => Promise<string | null>
  refresh: () => Promise<void>
}

const AccountingContext = createContext<AccountingContextValue | null>(null)

export function AccountingProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const { user, allowed } = useAuth()
  const [movements, setMovements] = useState<Movimento[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [hydrated, setHydrated] = useState(false)

  const refresh = useCallback(async () => {
    if (!user || !allowed) { setHydrated(true); return }
    setHydrated(false)
    const [{ data: tm }, { data: cats }, { data: rows, error }] = await Promise.all([
      supabase.from('team_members').select('id,name,email').eq('active', true).order('name'),
      supabase.from('categories').select('id,name,type').eq('active', true).order('type').order('name'),
      supabase.from('movements').select(`
        id,type,amount,transaction_date,description,counterparty,payment_method,created_at,category_id,member_id,
        categories(name),team_members(name),attachments(id,file_name,mime_type,storage_path)
      `).order('transaction_date', { ascending: false }).order('created_at', { ascending: false }),
    ])
    if (error) console.error(error)
    setMembers((tm ?? []) as TeamMember[])
    setCategories(((cats ?? []) as any[]).map(c => ({ id:c.id, name:c.name, type:c.type as Tipo })))

    const mapped: Movimento[] = []
    for (const row of (rows ?? []) as any[]) {
      const att = Array.isArray(row.attachments) ? row.attachments[0] : row.attachments
      let signedUrl: string | undefined
      if (att?.storage_path) {
        const { data } = await supabase.storage.from('movement-attachments').createSignedUrl(att.storage_path, 3600)
        signedUrl = data?.signedUrl
      }
      mapped.push({
        id: row.id,
        tipo: row.type,
        categoria: row.categories?.name ?? '',
        categoriaId: row.category_id,
        importo: Number(row.amount),
        data: row.transaction_date,
        utente: row.team_members?.name ?? '',
        utenteId: row.member_id,
        descrizione: row.description ?? row.categories?.name ?? '',
        metodo: METODO_PAGAMENTO,
        controparte: row.counterparty ?? undefined,
        allegato: att ? { nome: att.file_name, tipo: att.mime_type ?? undefined, path: att.storage_path, url: signedUrl } : undefined,
        createdAt: row.created_at,
      })
    }
    setMovements(mapped)
    setHydrated(true)
  }, [supabase, user, allowed])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (!user || !allowed) return
    const channel = supabase.channel('movements-live')
      .on('postgres_changes', { event:'*', schema:'public', table:'movements' }, () => { refresh() })
      .subscribe()
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => { window.removeEventListener('focus', onFocus); supabase.removeChannel(channel) }
  }, [supabase, user, allowed, refresh])

  const addMovement = useCallback(async (movement: NewMovement) => {
    const { data, error } = await supabase.from('movements').insert({
      type: movement.tipo,
      category_id: movement.categoriaId,
      amount: movement.importo,
      transaction_date: movement.data,
      member_id: movement.utenteId,
      description: movement.descrizione,
      counterparty: movement.controparte || null,
      payment_method: METODO_PAGAMENTO,
    }).select('id').single()
    if (error) return error.message

    if (movement.allegato && data?.id) {
      const safeName = movement.allegato.name.replace(/[^a-zA-Z0-9._-]+/g, '-')
      const path = `${data.id}/${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('movement-attachments').upload(path, movement.allegato, { upsert:false })
      if (uploadError) return `Movimento salvato, ma allegato non caricato: ${uploadError.message}`
      const { error: metaError } = await supabase.from('attachments').insert({
        movement_id:data.id, storage_path:path, file_name:movement.allegato.name,
        mime_type:movement.allegato.type || null, size_bytes:movement.allegato.size,
      })
      if (metaError) return `Movimento salvato, ma allegato non registrato: ${metaError.message}`
    }
    await refresh()
    return null
  }, [supabase, refresh])

  const deleteMovement = useCallback(async (id: string) => {
    const movement = movements.find(m => m.id === id)
    if (movement?.allegato?.path) await supabase.storage.from('movement-attachments').remove([movement.allegato.path])
    const { error } = await supabase.from('movements').delete().eq('id', id)
    if (error) return error.message
    await refresh()
    return null
  }, [supabase, refresh, movements])

  const value = useMemo(() => ({ movements, members, categories, hydrated, addMovement, deleteMovement, refresh }), [movements, members, categories, hydrated, addMovement, deleteMovement, refresh])
  return <AccountingContext.Provider value={value}>{children}</AccountingContext.Provider>
}

export function useAccounting() {
  const value = useContext(AccountingContext)
  if (!value) throw new Error('useAccounting deve essere usato dentro AccountingProvider')
  return value
}
