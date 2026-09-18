import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import { Footer } from './components/layout/Footer'
import { useAuth } from './context/AuthContext'
import { useState } from 'react'
import type { Role } from './types'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/patient/PatientDashboard'
import Assessment from './pages/patient/Assessment'
import TriageResultPage from './pages/patient/TriageResultPage'
import Appointments from './pages/patient/Appointments'
import Privacy from './pages/patient/Privacy'
import Profile from './pages/patient/Profile'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import PatientQueuePage from './pages/doctor/PatientQueuePage'
import DoctorSchedule from './pages/doctor/DoctorSchedule'
import PatientDetailsPage from './pages/doctor/PatientDetailsPage'
import ConsultationPage from './pages/doctor/ConsultationPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import Patients from './pages/admin/Patients'
import Doctors from './pages/admin/Doctors'
import AdminAppointments from './pages/admin/Appointments'

function Protected({ role }: { role: Role }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />
  return <DashboardShell role={role} />
}

function DashboardShell({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  return <div className="flex min-h-screen flex-col bg-slate-50"><Navbar onMenu={()=>setOpen(true)}/><div className="flex flex-1"><Sidebar role={role} open={open} onClose={()=>setOpen(false)}/>{open&&<div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={()=>setOpen(false)}/>}<main className="min-w-0 flex-1"><div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet/></div></main></div><Footer/></div>
}

export default function App() {
  return <Routes>
    <Route path="/" element={<><Navbar/><Home/></>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route element={<Protected role="patient"/>}>
      <Route path="/patient" element={<PatientDashboard/>}/>
      <Route path="/patient/assessment" element={<Assessment/>}/>
      <Route path="/patient/result" element={<TriageResultPage/>}/>
      <Route path="/patient/appointments" element={<Appointments/>}/>
      <Route path="/patient/privacy" element={<Privacy/>}/>
      <Route path="/patient/profile" element={<Profile/>}/>
    </Route>
    <Route element={<Protected role="doctor"/>}>
      <Route path="/doctor" element={<DoctorDashboard/>}/>
      <Route path="/doctor/queue" element={<PatientQueuePage/>}/>
      <Route path="/doctor/schedule" element={<DoctorSchedule/>}/>
      <Route path="/doctor/patients/:id" element={<PatientDetailsPage/>}/>
      <Route path="/doctor/consultation/:id" element={<ConsultationPage/>}/>
    </Route>
    <Route element={<Protected role="admin"/>}>
      <Route path="/admin" element={<AdminDashboard/>}/>
      <Route path="/admin/patients" element={<Patients/>}/>
      <Route path="/admin/doctors" element={<Doctors/>}/>
      <Route path="/admin/appointments" element={<AdminAppointments/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}
