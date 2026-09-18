import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { useAuth, rolePath } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('patient@example.com')
  const [password, setPassword] = useState('password123')
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [error, setError] = useState('')

  const demoCredentials = {
    patient: { email: 'patient@example.com', password: 'password123' },
    doctor: { email: 'doctor@example.com', password: 'password123' }
  }

  function selectRole(nextRole: 'patient' | 'doctor') {
    setRole(nextRole)
    setEmail(demoCredentials[nextRole].email)
    setPassword(demoCredentials[nextRole].password)
    setError('')
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()

    if (!login(email, password, role)) {
      setError('Invalid credentials for the selected role.')
      return
    }

    const targetPath = (loc.state as { from?: string })?.from || rolePath(role)
    nav(targetPath)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <Card className="w-full max-w-md p-7">
        <Link to="/" className="mb-6 inline-flex text-sm font-bold text-sky-600 hover:text-sky-700">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-black">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to the CareFlow prototype.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold">
            Role
            <select
              value={role}
              onChange={(e) => selectRole(e.target.value as 'patient' | 'doctor')}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-sky-500 focus:outline-none"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </label>

          <label className="block text-sm font-semibold">
            Email
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="block text-sm font-semibold">
            Password
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <Button className="w-full" type="submit">Sign in</Button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
          <b>Demo credentials</b>
          <br />Patient: patient@example.com / password123
          <br />Doctor: doctor@example.com / password123
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          New patient? <Link className="font-bold text-sky-600" to="/register">Create an account</Link>
        </p>
      </Card>
    </main>
  )
}
