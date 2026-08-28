export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-white/50 bg-white/70 px-8 py-10 text-center shadow-lg backdrop-blur">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-kitchen-sage/15 text-2xl">
        🍳
      </div>
      <h2 className="text-xl font-semibold text-kitchen-charcoal">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-kitchen-charcoal/70">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-kitchen-terracotta px-5 py-2 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
