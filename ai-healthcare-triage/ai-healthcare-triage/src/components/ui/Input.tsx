import type { InputHTMLAttributes } from 'react'
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 ${props.className || ''}`} />
}
