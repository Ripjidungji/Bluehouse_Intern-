import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { TriageResult } from '../../components/patient/TriageResult'
import { useAssessment } from '../../hooks/useAssessment'
import type { Assessment } from '../../types'

export default function TriageResultPage() {
  const { assessment } = useAssessment()
  const [consent, setConsent] = useState(() => localStorage.getItem('triage_share_consent') === 'true')

  if (!assessment) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center">
        <h1 className="text-2xl font-black">No assessment yet</h1>
        <Link to="/patient/assessment" className="mt-4 inline-block font-bold text-sky-600">
          Start an assessment
        </Link>
      </div>
    )
  }

  const a = assessment as Assessment

  const handleConsent = (allowed: boolean) => {
    setConsent(allowed)
    localStorage.setItem('triage_share_consent', String(allowed))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-600">Your assessment</p>
        <h1 className="mt-1 text-3xl font-black">Assessment result</h1>
      </div>

      <TriageResult
        result={{
          priority: a.priority,
          specialty: a.specialty,
          reason:
            a.priority === 'EMERGENCY'
              ? 'An emergency warning sign was reported. Seek immediate professional or emergency care.'
              : a.priority === 'HIGH'
                ? 'The information provided indicates a higher reported level of urgency and should be reviewed promptly.'
                : a.priority === 'MEDIUM'
                  ? 'The reported symptoms may benefit from a timely clinical assessment.'
                  : 'Based on the information provided, a routine care pathway may be appropriate.',
          emergency: a.priority === 'EMERGENCY'
        }}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black">Doctor-ready summary</h2>
        <dl className="mt-4 space-y-3 text-sm text-slate-700">
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Main concern</dt><dd className="font-semibold text-right">{a.symptom || 'Not specified'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Started</dt><dd className="font-semibold text-right">{a.duration || 'Not specified'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Severity</dt><dd className="font-semibold text-right">{a.severity}/10</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Medications</dt><dd className="font-semibold text-right">{a.medications || 'None listed'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Allergies</dt><dd className="font-semibold text-right">{a.allergies || 'None listed'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Other notes</dt><dd className="font-semibold text-right">{a.otherSymptoms || 'None'}</dd></div>
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black">Before sharing your summary</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          You are about to share your symptom assessment, medications, and allergies with your selected doctor or care team.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => handleConsent(true)}>
            {consent ? 'Consent granted' : 'Allow sharing'}
          </Button>
          <Button onClick={() => handleConsent(false)} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to={consent ? '/patient/appointments' : '#'} onClick={(e) => !consent && e.preventDefault()}>
          <Button disabled={!consent}>Book Appointment</Button>
        </Link>
        <Link to="/patient/assessment">
          <Button variant="secondary">Retake Assessment</Button>
        </Link>
      </div>
    </div>
  )
}

