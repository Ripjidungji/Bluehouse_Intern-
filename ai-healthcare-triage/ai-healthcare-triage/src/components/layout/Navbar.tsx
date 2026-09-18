import { HeartPulse, LogOut, Menu, UserCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function Navbar({ onMenu }: { onMenu?: () => void }) {
  const { user, logout } = useAuth()
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenu && <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={onMenu}><Menu size={21}/></button>}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-slate-900"><span className="rounded-xl bg-sky-600 p-2 text-white"><HeartPulse size={19}/></span> CareFlow</Link>
      </div>
      <div className="flex items-center gap-3">
        {user ? <><span className="hidden text-sm text-slate-500 sm:block">{user.name}</span><button onClick={logout} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><LogOut size={17}/> Logout</button></> : <Link to="/login" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><UserCircle size={17}/> Sign in</Link>}
      </div>
    </div>
  </header>
}
