import type { Doctor } from '../types'

export const doctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Johnson', specialty: 'General Practitioner', email: 'sarah@clinic.demo', experience: '12 years', available: true, availability: { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', slotMinutes: 30 } },
  { id: 'd2', name: 'Dr. Michael Chen', specialty: 'Dermatology', email: 'michael@clinic.demo', experience: '9 years', available: true, availability: { days: [1, 2, 3, 4, 5], start: '10:00', end: '16:00', slotMinutes: 30 } },
  { id: 'd3', name: 'Dr. Amina Yusuf', specialty: 'General Practitioner', email: 'amina@clinic.demo', experience: '8 years', available: true, availability: { days: [2, 3, 4, 5, 6], start: '09:00', end: '15:00', slotMinutes: 30 } },
  { id: 'd4', name: 'Dr. David Okoro', specialty: 'Urgent Care', email: 'david@clinic.demo', experience: '14 years', available: true, availability: { days: [1, 2, 3, 4, 5, 6], start: '08:00', end: '18:00', slotMinutes: 30 } }
]
