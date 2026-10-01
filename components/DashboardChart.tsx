'use client'

import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { useAccounting } from '@/components/AccountingProvider'

export default function DashboardChart(){
  const { movements } = useAccounting()
  const data = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    const buckets = Array.from({length: days}, (_, i) => ({ giorno: String(i + 1), entrate: 0, uscite: 0 }))
    movements.forEach(m => {
      const d = new Date(`${m.data}T12:00:00`)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const bucket = buckets[d.getDate() - 1]
        if (m.tipo === 'entrata') bucket.entrate += m.importo
        else bucket.uscite += m.importo
      }
    })
    return buckets
  }, [movements])

  return <div className="chart-shell"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{top:4,right:8,left:-10,bottom:0}}><CartesianGrid stroke="#ececec" strokeDasharray="4 4"/><XAxis dataKey="giorno" tick={{fontSize:11}} interval="preserveStartEnd" axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/><Tooltip formatter={(value) => new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(value))}/><Legend/><Line type="monotone" name="Entrate" dataKey="entrate" stroke="#ffb200" strokeWidth={4} dot={false} activeDot={{r:5}}/><Line type="monotone" name="Uscite" dataKey="uscite" stroke="#151515" strokeWidth={3} dot={false} activeDot={{r:5}}/></LineChart></ResponsiveContainer></div>
}
