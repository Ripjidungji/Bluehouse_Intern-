import { Card } from '../../components/ui/Card'

export default function Privacy() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-600">Privacy</p>
        <h1 className="mt-1 text-3xl font-black">Your data controls</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-black">What is stored</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Symptoms and assessment history</li>
          <li>Severity and duration information</li>
          <li>Medications and allergy details</li>
          <li>Selected care pathway and appointment context</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-black">Who can access it</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>You, the patient</li>
          <li>Your assigned doctor or care team</li>
          <li>Authorized administrator users only</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-black">Consent and sharing</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Before sharing your assessment with a clinician, you must explicitly approve the transfer. This keeps patient data transparent and under user control.
        </p>
      </Card>
    </div>
  )
}
