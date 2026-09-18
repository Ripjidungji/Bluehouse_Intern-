import { Link, useParams } from 'react-router-dom'
import { PatientDetails } from '../../components/doctor/PatientDetails'
import { Button } from '../../components/ui/Button'
import { patients } from '../../data/patients'
import { useAppointments } from '../../hooks/useAppointments'
export default function PatientDetailsPage(){const{id}=useParams();const patient=patients.find(p=>p.id===id)||patients[0];const{updateStatus}=useAppointments();const appointmentId=patient.id==='p1'?'a1':patient.id==='p2'?'a2':patient.id==='p3'?'a3':patient.id==='p4'?'a4':'a5';return <div className="space-y-5"><div><Link to="/doctor/queue" className="text-sm font-semibold text-sky-600">← Back to queue</Link><h1 className="mt-2 text-3xl font-black">Patient details</h1></div><PatientDetails patient={patient}/><div className="flex flex-wrap gap-3"><Button onClick={()=>updateStatus(appointmentId,'In Consultation')}>Start consultation</Button><Link to={`/doctor/consultation/${patient.id}`}><Button variant="secondary">View consultation brief</Button></Link><Button variant="secondary" onClick={()=>updateStatus(appointmentId,'Completed')}>Mark completed</Button></div></div>}
