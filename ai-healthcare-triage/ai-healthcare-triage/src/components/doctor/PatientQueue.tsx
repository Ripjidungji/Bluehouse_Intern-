import type { Patient } from '../../types'
import { sortQueue } from '../../utils/queue'
import { PatientCard } from './PatientCard'
export function PatientQueue({ patients }: { patients: Patient[] }) { return <div className="space-y-3">{sortQueue(patients).map(p=><PatientCard key={p.id} patient={p}/>)}</div> }
