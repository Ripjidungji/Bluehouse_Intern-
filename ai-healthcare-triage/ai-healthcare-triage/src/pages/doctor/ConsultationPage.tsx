import { Link, useParams } from 'react-router-dom'
import { ConsultationBrief } from '../../components/doctor/ConsultationBrief'
import { PatientDetails } from '../../components/doctor/PatientDetails'
import { patients } from '../../data/patients'
import type { Assessment } from '../../types'

export default function ConsultationPage() {
  const { id } = useParams()
  const patient = patients.find((p) => p.id === id) || patients[0]

  const assessment: Assessment = {
    id: 'demo',
    patientId: patient.id,
    symptom: patient.lastAssessment.split(',')[0],
    duration: patient.lastAssessment.includes(',') ? patient.lastAssessment.split(',').slice(1).join(',').trim() : '3 days',
    severity: patient.priority === 'HIGH' ? 8 : patient.priority === 'MEDIUM' ? 7 : 4,
    fever: false,
    worsening: patient.priority === 'HIGH',
    severePain: patient.priority === 'HIGH' || patient.priority === 'EMERGENCY',
    breathingDifficulty: false,
    medications: 'Not provided',
    allergies: 'None reported',
    otherSymptoms: '',
    priority: patient.priority,
    specialty: patient.specialty,
    createdAt: new Date().toISOString()
  }

  return (
    <div className="space-y-5">
      <Link to={`/doctor/patients/${patient.id}`} className="text-sm font-semibold text-sky-600">← Back to patient</Link>
      <h1 className="text-3xl font-black">Consultation</h1>
      <PatientDetails patient={patient} />
      <ConsultationBrief patient={patient} assessment={assessment} />
    </div>
  )
}
