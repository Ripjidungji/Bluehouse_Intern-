import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Patient } from '../../types'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
export function PatientCard({ patient }: { patient: Patient }) { return <Card className="p-4"><div className="flex flex-wrap items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-700">{patient.name.split(' ').map(x=>x[0]).join('')}</div><div className="min-w-40 flex-1"><h3 className="font-bold">{patient.name}</h3><p className="text-sm text-slate-500">{patient.specialty} · {patient.appointmentTime}</p></div><Badge value={patient.priority}/><Badge value={patient.status}/><Link to={`/doctor/patients/${patient.id}`} className="rounded-lg p-2 text-sky-600 hover:bg-sky-50"><ArrowRight size={19}/></Link></div></Card> }
