import type { Appointment } from '../types'

export const appointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'John Doe', doctorId: 'd1', doctorName: 'Dr. Sarah Johnson', specialty: 'General Practitioner', date: '2026-09-18', time: '09:30 AM', type: 'Telehealth', status: 'Waiting', priority: 'MEDIUM' },
  { id: 'a2', patientId: 'p2', patientName: 'Grace Miller', doctorId: 'd2', doctorName: 'Dr. Michael Chen', specialty: 'Dermatology', date: '2026-09-18', time: '10:15 AM', type: 'In-person', status: 'Scheduled', priority: 'LOW' },
  { id: 'a3', patientId: 'p3', patientName: 'Daniel Smith', doctorId: 'd4', doctorName: 'Dr. David Okoro', specialty: 'Urgent Care', date: '2026-09-18', time: '10:30 AM', type: 'In-person', status: 'Waiting', priority: 'HIGH' },
  { id: 'a4', patientId: 'p4', patientName: 'Mary Williams', doctorId: 'd1', doctorName: 'Dr. Sarah Johnson', specialty: 'General Practitioner', date: '2026-09-18', time: '11:00 AM', type: 'Telehealth', status: 'Completed', priority: 'LOW' },
  { id: 'a5', patientId: 'p5', patientName: 'Alex Brown', doctorId: 'd4', doctorName: 'Dr. David Okoro', specialty: 'Urgent Care', date: '2026-09-18', time: '11:20 AM', type: 'In-person', status: 'Waiting', priority: 'EMERGENCY' }
]
