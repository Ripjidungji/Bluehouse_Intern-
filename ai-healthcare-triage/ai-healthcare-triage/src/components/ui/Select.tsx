import type { SelectHTMLAttributes } from 'react'
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 ${props.className || ''}`} />
}
