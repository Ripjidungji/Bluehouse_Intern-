export type Role = 'patient' | 'doctor' | 'admin'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
export type AppointmentStatus = 'Scheduled' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled'
export type AppointmentType = 'In-person' | 'Telehealth'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
}

export interface Patient {
  id: string
  name: string
  age: number
  email: string
  phone: string
  specialty: string
  priority: Priority
  status: AppointmentStatus
  appointmentTime: string
  lastAssessment: string
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  email: string
  experience: string
  available: boolean
  availability: {
    days: number[]
    start: string
    end: string
    slotMinutes: number
  }
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  type: AppointmentType
  status: AppointmentStatus
  priority: Priority
}

export interface Assessment {
  id: string
  patientId: string
  symptom: string
  duration: string
  severity: number
  fever: boolean
  worsening: boolean
  severePain: boolean
  breathingDifficulty: boolean
  medications: string
  allergies: string
  otherSymptoms: string
  priority: Priority
  specialty: string
  createdAt: string
  consentToShare?: boolean
}

export interface TriageResult {
  priority: Priority
  specialty: string
  reason: string
  emergency: boolean
}
