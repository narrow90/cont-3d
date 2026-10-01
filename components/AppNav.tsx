'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/movimenti', label: 'Movimenti', icon: 'wallet' },
  { href: '/report', label: 'Report', icon: 'chart' },
  { href: '/profilo', label: 'Profilo', icon: 'user' },
]

function Icon({name}:{name:string}) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (name === 'home') return <svg {...common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>
  if (name === 'wallet') return <svg {...common}><path d="M4 6.5h13a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12"/><path d="M20 11h-5a2 2 0 0 0 0 4h5"/><circle cx="15" cy="13" r=".5" fill="currentColor" stroke="none"/></svg>
  if (name === 'chart') return <svg {...common}><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>
  return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
}

export function DesktopNav(){
  const pathname = usePathname()
  return <nav className="nav">{links.map(link=><Link key={link.href} className={pathname.startsWith(link.href)?'active':''} href={link.href}><Icon name={link.icon}/><span>{link.label === 'Home' ? 'Dashboard' : link.label}</span></Link>)}</nav>
}

export function MobileNav(){
  const pathname = usePathname()
  return <nav className="mobile-nav" aria-label="Navigazione principale">
    {links.map(link=><Link key={link.href} className={pathname.startsWith(link.href)?'active':''} href={link.href}><span className="nav-icon"><Icon name={link.icon}/></span><span className="nav-label">{link.label}</span></Link>)}
  </nav>
}
