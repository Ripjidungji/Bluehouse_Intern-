import { CalendarDays, Stethoscope, Users, ListOrdered } from 'lucide-react'
import { StatCard } from '../../components/dashboard/StatCard'
import { AppointmentChart } from '../../components/dashboard/AppointmentChart'
import { patients } from '../../data/patients'
export default function AdminDashboard(){return <div className="space-y-7"><h1 className="text-3xl font-black">System dashboard</h1><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total patients" value="1,284" icon={<Users/>}/><StatCard label="Total doctors" value="48" icon={<Stethoscope/>}/><StatCard label="Today's appointments" value="86" icon={<CalendarDays/>}/><StatCard label="Active queue" value={patients.length} icon={<ListOrdered/>}/></div><AppointmentChart/></div>}
