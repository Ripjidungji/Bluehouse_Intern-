export default function Header({ onSurprise, loading }) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-10 pb-6 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-kitchen-sage">
        Fresh & Flavorful
      </p>
      <h1 className="text-4xl font-bold text-kitchen-charcoal sm:text-5xl">
        Kitchen<span className="text-kitchen-terracotta">Craft</span> Recipes
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-kitchen-charcoal/70">
        Discover dishes by name or by what is already in your pantry.
      </p>
      <button
        type="button"
        onClick={onSurprise}
        disabled={loading}
        className="mt-5 rounded-full border border-kitchen-terracotta/30 bg-white/70 px-5 py-2 text-sm font-semibold text-kitchen-terracotta shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-50"
      >
        {loading ? 'Finding a surprise…' : 'Surprise me'}
      </button>
    </header>
  )
}
