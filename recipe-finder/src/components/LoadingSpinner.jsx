export default function LoadingSpinner({ label = 'Loading recipes…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-kitchen-charcoal/70">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-kitchen-sage/30 border-t-kitchen-terracotta" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}
