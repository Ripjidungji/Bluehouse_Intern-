import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { doctors } from '../../data/doctors'
import { getAvailableTimeSlots } from '../../utils/availability'
import type { Appointment, Priority } from '../../types'

export function AppointmentModal({ open, onClose, onCreate, specialty, priority = 'LOW' }: {
  open: boolean
  onClose: () => void
  onCreate: (appointment: Appointment) => void
  specialty?: string
  priority?: Priority
}) {
  const matchingDoctors = doctors.filter((doctor) => !specialty || doctor.specialty === specialty)
  const [doctorId, setDoctorId] = useState(matchingDoctors[0]?.id || doctors[0].id)
  const [date, setDate] = useState('2026-09-19')
  const [time, setTime] = useState('')
  const [type, setType] = useState<Appointment['type']>('Telehealth')
  const doctor = doctors.find((item) => item.id === doctorId) || matchingDoctors[0] || doctors[0]
  const availableTimes = getAvailableTimeSlots(doctor, date)

  useEffect(() => {
    if (!availableTimes.includes(time)) setTime(availableTimes[0] || '')
  }, [date, doctorId, availableTimes, time])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!time) return

    onCreate({
      id: `a-${Date.now()}`,
      patientId: 'u1',
      patientName: 'John Doe',
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date,
      time,
      type,
      status: 'Scheduled',
      priority
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Book an appointment">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">
          Doctor
          <Select value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
            {matchingDoctors.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.specialty}</option>)}
          </Select>
        </label>

        <label className="block text-sm font-semibold">
          Date
          <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>

        <label className="block text-sm font-semibold">
          Available time
          <Select required value={time} onChange={(event) => setTime(event.target.value)} disabled={availableTimes.length === 0}>
            {availableTimes.length > 0
              ? availableTimes.map((slot) => <option key={slot} value={slot}>{slot}</option>)
              : <option value="">Doctor unavailable on this date</option>}
          </Select>
          <span className="mt-1 block text-xs font-normal text-slate-500">
            {availableTimes.length > 0 ? `${availableTimes.length} available slots for this doctor` : 'Choose another date or doctor.'}
          </span>
        </label>

        <label className="block text-sm font-semibold">
          Appointment type
          <Select value={type} onChange={(event) => setType(event.target.value as Appointment['type'])}>
            <option>Telehealth</option>
            <option>In-person</option>
          </Select>
        </label>

        <Button type="submit" className="w-full" disabled={!time}>Confirm appointment</Button>
      </form>
    </Modal>
  )
}