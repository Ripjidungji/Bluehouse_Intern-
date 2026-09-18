import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'
import type { TriageResult } from '../../types'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
export function TriageResult({ result }: { result: TriageResult }) {
  return <div className="space-y-5"><Card className={`p-6 ${result.emergency ? 'border-red-200 bg-red-50' : ''}`}>
    <div className="flex items-start gap-4">{result.emergency ? <ShieldAlert className="text-red-600" size={28}/> : result.priority === 'HIGH' ? <AlertTriangle className="text-orange-600" size={28}/> : <CheckCircle2 className="text-emerald-600" size={28}/>}
    <div className="flex-1"><p className="text-sm font-semibold text-slate-500">Priority</p><div className="mt-1"><Badge value={result.priority}/></div><h3 className="mt-5 text-lg font-bold">Suggested care: {result.specialty}</h3><p className="mt-2 text-slate-600">{result.reason}</p></div></div>
  </Card><p className="rounded-xl bg-slate-100 p-4 text-xs leading-5 text-slate-600"><b>Important:</b> This result is not a diagnosis and does not replace professional medical advice.</p></div>
}
