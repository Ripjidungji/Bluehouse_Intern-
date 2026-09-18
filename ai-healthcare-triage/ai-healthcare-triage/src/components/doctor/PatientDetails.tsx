import type { Patient } from '../../types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
export function PatientDetails({ patient }: { patient: Patient }) { return <Card className="p-6"><h2 className="text-xl font-bold">{patient.name}</h2><p className="mt-1 text-slate-500">{patient.age} years · {patient.email} · {patient.phone}</p><div className="mt-5 flex flex-wrap gap-2"><Badge value={patient.priority}/><Badge value={patient.status}/></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div><p className="text-xs text-slate-500">Suggested specialty</p><b>{patient.specialty}</b></div><div><p className="text-xs text-slate-500">Last assessment</p><b>{patient.lastAssessment}</b></div></div></Card> }
