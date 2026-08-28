export default function RecipeCard({ recipe, searchMode, onClick, loading }) {
  const usedCount = recipe.usedIngredients?.length ?? 0
  const missedCount = recipe.missedIngredientCount ?? 0

  return (
    <button
      type="button"
      onClick={() => onClick(recipe.id)}
      disabled={loading}
      className="group overflow-hidden rounded-2xl border border-white/60 bg-white text-left shadow-md transition hover:-translate-y-1 hover:shadow-2xl disabled:opacity-60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-kitchen-cream">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {searchMode === 'ingredients' && (
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="rounded-full bg-kitchen-sage px-2 py-1 text-xs font-semibold text-white">
              {usedCount} used
            </span>
            {missedCount > 0 && (
              <span className="rounded-full bg-kitchen-terracotta px-2 py-1 text-xs font-semibold text-white">
                {missedCount} missing
              </span>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-kitchen-charcoal">{recipe.title}</h3>
        {recipe.readyInMinutes != null && (
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-kitchen-sage">
            {recipe.readyInMinutes} min
          </p>
        )}
      </div>
    </button>
  )
}
