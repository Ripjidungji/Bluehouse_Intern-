import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssessmentProgress } from '../../components/patient/AssessmentProgress'
import { SymptomForm } from '../../components/patient/SymptomForm'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { symptoms, durations } from '../../data/symptoms'
import { analyzeAssessment } from '../../utils/triage'
import type { Assessment } from '../../types'

export default function AssessmentPage() {
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    symptom: '',
    duration: '',
    severity: 5,
    fever: false,
    worsening: false,
    severePain: false,
    breathingDifficulty: false,
    medications: '',
    allergies: '',
    otherSymptoms: ''
  })

  const total = 5
  const update = (key: string, value: unknown) => setData((d) => ({ ...d, [key]: value }))
  const selectedSymptoms = data.symptom ? data.symptom.split(', ').filter(Boolean) : []

  const toggleSymptom = (symptom: string) => {
    setData((current) => {
      const currentSymptoms = current.symptom ? current.symptom.split(', ').filter(Boolean) : []
      const nextSymptoms = currentSymptoms.includes(symptom)
        ? currentSymptoms.filter((item) => item !== symptom)
        : [...currentSymptoms, symptom]

      return { ...current, symptom: nextSymptoms.join(', ') }
    })
  }

  function next() {
    if (step < total) {
      setStep(step + 1)
      return
    }

    const result = analyzeAssessment(data)
    const assessment: Assessment = {
      ...data,
      id: `as-${Date.now()}`,
      patientId: 'u1',
      priority: result.priority,
      specialty: result.specialty,
      createdAt: new Date().toISOString(),
      consentToShare: true
    }

    localStorage.setItem('latest_assessment', JSON.stringify(assessment))
    nav('/patient/result')
  }

  return (
    <div className="py-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black">Symptom assessment</h1>
        <p className="mt-2 text-slate-500">
          A short pre-consultation questionnaire to prepare for your healthcare visit. It does not diagnose medical conditions.
        </p>

        <SymptomForm>
          <AssessmentProgress step={step} total={total} />

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold">Select all symptoms that apply</h2>
              <p className="mt-2 text-sm text-slate-500">Choose one or more concerns you are experiencing.</p>

              {selectedSymptoms.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedSymptoms.map((s) => (
                    <span key={s} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {symptoms.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`rounded-xl border p-3 text-sm font-semibold ${
                      selectedSymptoms.includes(s)
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold">How long have you experienced this?</h2>
              <div className="mt-5 space-y-3">
                {durations.map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => update('duration', d)}
                    className={`block w-full rounded-xl border p-3 text-left font-semibold ${
                      data.duration === d ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold">How severe is it?</h2>
              <p className="mt-2 text-slate-500">Choose a number from 1 (mild) to 10 (severe).</p>
              <div className="mt-7 text-center text-5xl font-black text-sky-600">{data.severity}</div>
              <input
                className="mt-5 w-full accent-sky-600"
                type="range"
                min="1"
                max="10"
                value={data.severity}
                onChange={(e) => update('severity', Number(e.target.value))}
              />
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>1 Mild</span>
                <span>10 Severe</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold">Add important medical context</h2>
              <div className="mt-5 space-y-4">
                {[
                  ['fever', 'Do you have a fever?'],
                  ['worsening', 'Are your symptoms getting worse?'],
                  ['severePain', 'Are you experiencing severe pain?'],
                  ['breathingDifficulty', 'Are you having difficulty breathing?']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 font-semibold">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-sky-600"
                      checked={Boolean(data[key as keyof typeof data])}
                      onChange={(e) => update(key, e.target.checked)}
                    />
                  </label>
                ))}

                <label className="block text-sm font-semibold">
                  Current medications
                  <Input
                    value={data.medications}
                    onChange={(e) => update('medications', e.target.value)}
                    placeholder="Optional: e.g. ibuprofen, vitamin D"
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Allergies or sensitivities
                  <Input
                    value={data.allergies}
                    onChange={(e) => update('allergies', e.target.value)}
                    placeholder="Optional: e.g. penicillin, peanuts"
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Any other symptoms?
                  <Input
                    value={data.otherSymptoms}
                    onChange={(e) => update('otherSymptoms', e.target.value)}
                    placeholder="Optional"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold">Review your answers</h2>
              <dl className="mt-5 space-y-3 text-sm">
                {Object.entries(data).map(([k, v]) => (
                  <div className="flex justify-between gap-5 border-b pb-3" key={k}>
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-right font-semibold">{String(v) || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            {step > 1 ? (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>
            ) : (
              <span />
            )}

            <Button
              disabled={(step === 1 && !data.symptom) || (step === 2 && !data.duration)}
              onClick={next}
            >
              {step === total ? 'Complete assessment' : 'Continue'}
            </Button>
          </div>
        </SymptomForm>
      </div>
    </div>
  )
}
