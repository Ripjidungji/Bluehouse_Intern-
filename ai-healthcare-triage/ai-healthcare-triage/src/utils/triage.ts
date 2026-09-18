import type { Assessment, TriageResult } from '../types'

export function analyzeAssessment(data: Omit<Assessment, 'id' | 'patientId' | 'priority' | 'specialty' | 'createdAt'>): TriageResult {
  const selectedSymptoms = data.symptom ? data.symptom.split(', ').filter(Boolean) : []
  const hasSymptom = (symptom: string) => selectedSymptoms.includes(symptom)
  const skinRelated = hasSymptom('Skin problem')
  const chestDiscomfort = hasSymptom('Chest discomfort')

  if (data.breathingDifficulty || (chestDiscomfort && data.severePain)) {
    return {
      priority: 'EMERGENCY',
      specialty: 'Emergency Care',
      reason: 'An emergency warning sign was reported. Seek immediate professional medical attention rather than relying on this application.',
      emergency: true
    }
  }

  if (data.severePain || data.worsening || data.severity >= 8) {
    return {
      priority: 'HIGH',
      specialty: skinRelated ? 'Dermatology' : 'Urgent Care',
      reason: 'The information provided indicates a higher reported level of urgency and should be reviewed promptly by a qualified healthcare professional.',
      emergency: false
    }
  }

  if (data.severity >= 5 || data.fever) {
    return {
      priority: 'MEDIUM',
      specialty: skinRelated ? 'Dermatology' : 'General Practitioner',
      reason: 'The reported symptoms may benefit from a timely clinical assessment.',
      emergency: false
    }
  }

  return {
    priority: 'LOW',
    specialty: skinRelated ? 'Dermatology' : 'Telehealth',
    reason: 'Based on the information provided, a routine care pathway may be appropriate.',
    emergency: false
  }
}
