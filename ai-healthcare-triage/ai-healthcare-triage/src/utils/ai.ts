import type { Assessment } from '../types'

export function generateConsultationBrief(assessment: Assessment, patientName: string, age: number) {
  const feverText = assessment.fever ? 'Fever was reported.' : 'No fever was reported.'
  const medicationText = assessment.medications ? ` Medications currently being taken: ${assessment.medications}.` : ''
  const allergyText = assessment.allergies ? ` Allergies: ${assessment.allergies}.` : ''
  const extra = assessment.otherSymptoms ? ` Other symptoms noted: ${assessment.otherSymptoms}.` : ''
  return `${patientName}, age ${age}, reports ${assessment.symptom.toLowerCase()} lasting ${assessment.duration} with a reported severity of ${assessment.severity}/10. ${feverText}${medicationText}${allergyText}${extra} This is an AI-generated organizational summary and should be verified with the patient.`
}

export function analyzeAssessment() {
  return Promise.resolve({ message: 'AI provider placeholder. Connect a secure backend service before production use.' })
}
