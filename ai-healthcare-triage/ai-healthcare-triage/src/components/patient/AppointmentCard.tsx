import { CalendarDays, Clock, Video } from 'lucide-react'
import type { Appointment } from '../../types'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
export function AppointmentCard({ appointment }: { appointment: Appointment }) { return <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{appointment.doctorName}</h3><p className="text-sm text-slate-500">{appointment.specialty}</p></div><Badge value={appointment.status}/></div><div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3"><span className="flex gap-2"><CalendarDays size={17}/>{appointment.date}</span><span className="flex gap-2"><Clock size={17}/>{appointment.time}</span><span className="flex gap-2"><Video size={17}/>{appointment.type}</span></div></Card> }
