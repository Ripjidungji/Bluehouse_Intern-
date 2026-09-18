import type { Priority, AppointmentStatus } from '../../types'
export function Badge({ value }: { value: Priority | AppointmentStatus | string }) {
  const key = value.toUpperCase()
  const styles: Record<string, string> = {
    EMERGENCY: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-amber-100 text-amber-700', LOW: 'bg-emerald-100 text-emerald-700',
    WAITING: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-emerald-100 text-emerald-700',
    'IN CONSULTATION': 'bg-violet-100 text-violet-700', SCHEDULED: 'bg-slate-100 text-slate-700'
  }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[key] || 'bg-slate-100 text-slate-700'}`}>{value}</span>
}
