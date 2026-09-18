import { PatientQueue } from '../../components/doctor/PatientQueue'
import { patients } from '../../data/patients'
export default function PatientQueuePage(){return <div><h1 className="text-3xl font-black">Priority queue</h1><p className="mt-2 text-slate-500">Prototype queue based on reported urgency; not clinically validated.</p><div className="mt-6"><PatientQueue patients={patients}/></div></div>}
