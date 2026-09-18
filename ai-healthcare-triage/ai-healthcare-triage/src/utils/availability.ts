import type { Doctor } from '../types'

export function getAvailableTimeSlots(doctor: Doctor, date: string) {
  if (!date || !doctor.available) return []

  const day = new Date(`${date}T12:00:00`).getDay()
  if (!doctor.availability.days.includes(day)) return []

  const slots: string[] = []
  const start = toMinutes(doctor.availability.start)
  const end = toMinutes(doctor.availability.end)

  for (let minutes = start; minutes < end; minutes += doctor.availability.slotMinutes) {
    slots.push(toDisplayTime(minutes))
  }

  return slots
}

export function isDoctorAvailableAt(doctor: Doctor, date: string, time: string) {
  return getAvailableTimeSlots(doctor, date).includes(time)
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function toDisplayTime(minutes: number) {
  const hour = Math.floor(minutes / 60)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${String(displayHour).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')} ${suffix}`
}