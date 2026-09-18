import type { ReactNode } from 'react'
import { X } from 'lucide-react'
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={onClose}>
    <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
      <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button></div>
      {children}
    </div>
  </div>
}
