import { useState } from 'react'
import { AppointmentCard } from '../../components/patient/AppointmentCard'
import { AppointmentModal } from '../../components/patient/AppointmentModal'
import { Button } from '../../components/ui/Button'
import { useAppointments } from '../../hooks/useAppointments'
import { useAssessment } from '../../hooks/useAssessment'
export default function Appointments(){const{items,addAppointment}=useAppointments();const{assessment}=useAssessment();const[open,setOpen]=useState(false);return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-sky-600">Patient</p><h1 className="text-3xl font-black">Appointments</h1></div><Button onClick={()=>setOpen(true)}>Book appointment</Button></div><div className="space-y-3">{items.map(a=><AppointmentCard key={a.id} appointment={a}/>)}</div><AppointmentModal open={open} onClose={()=>setOpen(false)} onCreate={addAppointment} specialty={assessment?.specialty} priority={assessment?.priority}/></div>}
