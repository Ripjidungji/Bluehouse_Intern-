import { useEffect, useState, type FormEvent } from 'react'
import { CalendarDays, Clock, Pencil, Plus, Trash2, Video } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAppointments } from '../../hooks/useAppointments'
import { patients } from '../../data/patients'
import { doctors } from '../../data/doctors'
import { getAvailableTimeSlots, isDoctorAvailableAt } from '../../utils/availability'
import type { Appointment, AppointmentStatus, AppointmentType, Priority } from '../../types'

const doctorId = 'd1'
const doctorName = 'Dr. Sarah Johnson'
const doctorSpecialty = 'General Practitioner'
const doctor = doctors.find((item) => item.id === doctorId) || doctors[0]
const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500'

type ScheduleForm = {
  patientId: string
  date: string
  time: string
  type: AppointmentType
  priority: Priority
}

const emptyForm: ScheduleForm = {
  patientId: patients[0].id,
  date: '2026-09-18',
  time: '09:00 AM',
  type: 'Telehealth',
  priority: 'LOW'
}

export default function DoctorSchedule() {
  const { items, addAppointment, updateAppointment, updateStatus, removeAppointment } = useAppointments()
  const [selectedDate, setSelectedDate] = useState('2026-09-18')
  const [form, setForm] = useState<ScheduleForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const schedule = items
    .filter((appointment) => appointment.doctorId === doctorId && appointment.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))
  const selectedPatient = patients.find((patient) => patient.id === form.patientId) || patients[0]
  const availableTimes = getAvailableTimeSlots(doctor, form.date)

  useEffect(() => {
    if (!availableTimes.includes(form.time)) {
      setForm((current) => ({ ...current, time: availableTimes[0] || '' }))
    }
  }, [availableTimes, form.time])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, date: selectedDate })
    setShowForm(true)
  }

  function openEdit(appointment: Appointment) {
    setEditingId(appointment.id)
    setForm({
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      priority: appointment.priority
    })
    setShowForm(true)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const patient = patients.find((item) => item.id === form.patientId) || patients[0]
    if (!isDoctorAvailableAt(doctor, form.date, form.time)) return

    if (editingId) {
      updateAppointment(editingId, {
        patientId: patient.id,
        patientName: patient.name,
        date: form.date,
        time: form.time,
        type: form.type,
        priority: form.priority
      })
    } else {
      addAppointment({
        id: `a-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        doctorId,
        doctorName,
        specialty: doctorSpecialty,
        date: form.date,
        time: form.time,
        type: form.type,
        status: 'Scheduled',
        priority: form.priority
      })
    }

    setSelectedDate(form.date)
    setShowForm(false)
  }

  function cancelAppointment(id: string) {
    if (window.confirm('Remove this appointment from your schedule?')) removeAppointment(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-600">Doctor workspace</p>
          <h1 className="text-3xl font-black">My schedule</h1>
          <p className="mt-2 text-slate-500">Create and manage patient appointments for your clinic.</p>
        </div>
        <Button onClick={openCreate}><Plus size={18} /> Add appointment</Button>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="block text-sm font-semibold">
            View date
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className={inputClass}
            />
          </label>
          <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
            <span className="font-black">{schedule.length}</span> appointment{schedule.length === 1 ? '' : 's'} scheduled
          </div>
        </div>
      </Card>

      {showForm && (
        <Card className="border-sky-200 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">{editingId ? 'Edit appointment' : 'Create appointment'}</h2>
              <p className="mt-1 text-sm text-slate-500">Changes are saved to this browser immediately.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-semibold text-slate-500 hover:text-slate-800">Close</button>
          </div>

          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">
              Patient
              <select value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} className={inputClass}>
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Date
              <input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">
              Available time
              <select required value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className={inputClass} disabled={availableTimes.length === 0}>
                {availableTimes.length > 0
                  ? availableTimes.map((slot) => <option key={slot} value={slot}>{slot}</option>)
                  : <option value="">Doctor unavailable on this date</option>}
              </select>
              <span className="mt-1 block text-xs font-normal text-slate-500">{availableTimes.length > 0 ? 'Only working-hour slots can be selected.' : 'Choose a weekday when you are available.'}</span>
            </label>
            <label className="block text-sm font-semibold">
              Appointment type
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as AppointmentType })} className={inputClass}>
                <option value="Telehealth">Telehealth</option>
                <option value="In-person">In-person</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Priority
              <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })} className={inputClass}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </label>
            <div className="flex items-end gap-3">
              <Button type="submit" disabled={!form.time}>{editingId ? 'Save changes' : 'Create appointment'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <section className="space-y-3">
        {schedule.length > 0 ? schedule.map((appointment) => (
          <Card key={appointment.id} className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-sky-50 p-3 text-center text-sky-700">
                  <Clock size={19} className="mx-auto" />
                  <span className="mt-1 block text-sm font-black">{appointment.time}</span>
                </div>
                <div>
                  <h2 className="font-black">{appointment.patientName}</h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><CalendarDays size={15} />{appointment.date}</span>
                    <span className="flex items-center gap-1"><Video size={15} />{appointment.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge value={appointment.priority} />
                <select
                  value={appointment.status}
                  onChange={(event) => updateStatus(appointment.id, event.target.value as AppointmentStatus)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-semibold"
                >
                  <option>Scheduled</option>
                  <option>Waiting</option>
                  <option>In Consultation</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
                <button type="button" title="Edit appointment" onClick={() => openEdit(appointment)} className="rounded-lg p-2 text-sky-600 hover:bg-sky-50"><Pencil size={18} /></button>
                <button type="button" title="Remove appointment" onClick={() => cancelAppointment(appointment.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={18} /></button>
              </div>
            </div>
          </Card>
        )) : (
          <Card className="p-10 text-center">
            <CalendarDays className="mx-auto text-slate-300" size={34} />
            <h2 className="mt-3 font-black">No appointments for this date</h2>
            <p className="mt-1 text-sm text-slate-500">Create a slot to start building your schedule.</p>
          </Card>
        )}
      </section>
    </div>
  )
}
