import type { ButtonHTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}
export function Button({ children, loading, variant = 'primary', className = '', ...props }: Props) {
  const styles = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
    {loading && <LoaderCircle className="animate-spin" size={17} />}{children}
  </button>
}
