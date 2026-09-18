import { CalendarDays, ClipboardCheck, FileText, LayoutDashboard, ListOrdered, ShieldCheck, Users, UserRound, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { Role } from '../../types'

const links = {
  patient: [
    ['/patient', 'Dashboard', LayoutDashboard],
    ['/patient/assessment', 'Assessment', ClipboardCheck],
    ['/patient/result', 'Latest Result', FileText],
    ['/patient/appointments', 'Appointments', CalendarDays],
    ['/patient/privacy', 'Privacy', ShieldCheck],
    ['/patient/profile', 'Profile', UserRound],
  ],
  doctor: [
    ['/doctor', 'Dashboard', LayoutDashboard],
    ['/doctor/queue', 'Priority Queue', ListOrdered],
    ['/doctor/schedule', 'Schedule', CalendarDays],
  ],
  admin: [
    ['/admin', 'Dashboard', LayoutDashboard],
    ['/admin/patients', 'Patients', Users],
    ['/admin/doctors', 'Doctors', Users],
    ['/admin/appointments', 'Appointments', CalendarDays],
  ]
} as const

export function Sidebar({ role, open, onClose }: { role: Role; open: boolean; onClose: () => void }) {
  return <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition lg:static lg:translate-x-0`}>
    <div className="flex h-16 items-center justify-between border-b px-5 lg:hidden"><b>Menu</b><button onClick={onClose}><X/></button></div>
    <nav className="space-y-1 p-4">
      {links[role].map(([to, label, Icon]) => <NavLink key={to} to={to} onClick={onClose} end={to === `/${role}`} className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={18}/>{label}</NavLink>)}
    </nav>
  </aside>
}
