import type { ReactNode } from 'react'
import { Card } from '../ui/Card'
export function StatCard({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) { return <Card className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p></div><div className="rounded-xl bg-sky-50 p-3 text-sky-600">{icon}</div></div></Card> }
