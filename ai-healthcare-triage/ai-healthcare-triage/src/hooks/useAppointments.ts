import { useEffect, useState } from 'react'
import type { Appointment } from '../types'
import { appointments as initial } from '../data/appointments'

export function useAppointments() {
  const [items, setItems] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('appointments')
    return saved ? JSON.parse(saved) : initial
  })

  useEffect(() => localStorage.setItem('appointments', JSON.stringify(items)), [items])

  function addAppointment(item: Appointment) {
    setItems(current => [item, ...current])
  }

  function updateStatus(id: string, status: Appointment['status']) {
    setItems(current => current.map(a => a.id === id ? { ...a, status } : a))
  }

  function updateAppointment(id: string, updates: Partial<Appointment>) {
    setItems(current => current.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  function removeAppointment(id: string) {
    setItems(current => current.filter(a => a.id !== id))
  }

  return { items, addAppointment, updateStatus, updateAppointment, removeAppointment }
}
