import type { Patient } from '../types'

export const patients: Patient[] = [
  { id: 'p1', name: 'John Doe', age: 32, email: 'john@example.com', phone: '+234 800 000 0001', specialty: 'General Practitioner', priority: 'MEDIUM', status: 'Waiting', appointmentTime: '09:30 AM', lastAssessment: 'Headache, 3 days' },
  { id: 'p2', name: 'Grace Miller', age: 28, email: 'grace@example.com', phone: '+234 800 000 0002', specialty: 'Dermatology', priority: 'LOW', status: 'Scheduled', appointmentTime: '10:15 AM', lastAssessment: 'Skin problem, 5 days' },
  { id: 'p3', name: 'Daniel Smith', age: 45, email: 'daniel@example.com', phone: '+234 800 000 0003', specialty: 'Urgent Care', priority: 'HIGH', status: 'Waiting', appointmentTime: '10:30 AM', lastAssessment: 'Severe stomach pain, 1 day' },
  { id: 'p4', name: 'Mary Williams', age: 39, email: 'mary@example.com', phone: '+234 800 000 0004', specialty: 'General Practitioner', priority: 'LOW', status: 'Completed', appointmentTime: '11:00 AM', lastAssessment: 'Cough, 4 days' },
  { id: 'p5', name: 'Alex Brown', age: 51, email: 'alex@example.com', phone: '+234 800 000 0005', specialty: 'Urgent Care', priority: 'EMERGENCY', status: 'Waiting', appointmentTime: '11:20 AM', lastAssessment: 'Chest discomfort' }
]
