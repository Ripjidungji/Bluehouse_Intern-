import { useState } from 'react'
import { CalendarDays, Clock3, Search, ShieldAlert, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../components/dashboard/StatCard'
import { AppointmentChart } from '../../components/dashboard/AppointmentChart'
import { ActivityList } from '../../components/dashboard/ActivityList'
import { PatientQueue } from '../../components/doctor/PatientQueue'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { appointments } from '../../data/appointments'
import { patients } from '../../data/patients'

type QueueFilter = 'all' | 'waiting' | 'priority' | 'completed'

export default function DoctorDashboard() {
  const [filter, setFilter] = useState<QueueFilter>('all')
  const [query, setQuery] = useState('')

  const todayAppointments = appointments.filter((appointment) => appointment.date === '2026-09-18')
  const waitingPatients = patients.filter((patient) => patient.status === 'Waiting')
  const priorityPatients = patients.filter((patient) => patient.priority === 'HIGH' || patient.priority === 'EMERGENCY')
  const completedPatients = patients.filter((patient) => patient.status === 'Completed')

  const filteredPatients = patients.filter((patient) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'waiting' && patient.status === 'Waiting') ||
      (filter === 'priority' && (patient.priority === 'HIGH' || patient.priority === 'EMERGENCY')) ||
      (filter === 'completed' && patient.status === 'Completed')
    const searchText = `${patient.name} ${patient.specialty} ${patient.lastAssessment}`.toLowerCase()
    return matchesFilter && searchText.includes(query.toLowerCase())
  })

  const filters: { label: string; value: QueueFilter; count: number }[] = [
    { label: 'All patients', value: 'all', count: patients.length },
    { label: 'Waiting', value: 'waiting', count: waitingPatients.length },
    { label: 'Priority review', value: 'priority', count: priorityPatients.length },
    { label: 'Completed', value: 'completed', count: completedPatients.length }
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-600">Doctor dashboard</p>
          <h1 className="text-3xl font-black">Today's overview</h1>
          <p className="mt-2 text-slate-500">Review your schedule, prioritize patients, and open consultation notes.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/doctor/queue"><Button variant="secondary">Open full queue</Button></Link>
          <Link to="/doctor/consultation/p5"><Button>Start next review</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's patients" value={todayAppointments.length} icon={<Users />} />
        <StatCard label="Waiting" value={waitingPatients.length} icon={<Clock3 />} />
        <StatCard label="High priority" value={priorityPatients.length} icon={<ShieldAlert />} />
        <StatCard label="Completed" value={completedPatients.length} icon={<CalendarDays />} />
      </div>

      {priorityPatients.some((patient) => patient.priority === 'EMERGENCY') && (
        <Card className="border-red-200 bg-red-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-red-800">Emergency case needs attention</p>
              <p className="mt-1 text-sm text-red-700">Alex Brown reported chest discomfort and is currently waiting.</p>
            </div>
            <Link to="/doctor/patients/p5"><Button variant="danger">Review patient</Button></Link>
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <AppointmentChart />
        <ActivityList />
      </div>

      <section>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black">Patient queue</h2>
            <p className="mt-1 text-sm text-slate-500">Sorted by reported urgency.</p>
          </div>
          <label className="relative block w-full lg:max-w-xs">
            <Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search patients"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500"
            />
          </label>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              type="button"
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                filter === item.value ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label} <span className={filter === item.value ? 'text-sky-100' : 'text-slate-400'}>({item.count})</span>
            </button>
          ))}
        </div>

        {filteredPatients.length > 0 ? (
          <PatientQueue patients={filteredPatients} />
        ) : (
          <Card className="p-8 text-center">
            <p className="font-bold text-slate-700">No patients match this view</p>
            <p className="mt-1 text-sm text-slate-500">Try another filter or clear the search.</p>
          </Card>
        )}
      </section>
    </div>
  )
}