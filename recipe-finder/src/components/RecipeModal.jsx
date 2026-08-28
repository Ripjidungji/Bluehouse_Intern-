import { useEffect } from 'react'
import { stripHtml } from '../api/spoonacular'
import ReviewSection from './ReviewSection'

export default function RecipeModal({ recipe, onClose, loading }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!recipe && !loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-kitchen-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={recipe?.title ?? 'Recipe details'}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-kitchen-charcoal shadow"
        >
          Close
        </button>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center p-10 text-kitchen-charcoal/70">
            Loading recipe details…
          </div>
        ) : (
          <>
            <img
              src={recipe.image}
              alt={recipe.title}
              className="h-56 w-full object-cover sm:h-72"
            />

            <div className="p-6 sm:p-8">
              <h2 className="text-3xl font-bold text-kitchen-charcoal">{recipe.title}</h2>

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {recipe.readyInMinutes != null && (
                  <span className="rounded-full bg-kitchen-sage/15 px-3 py-1 font-medium text-kitchen-sage">
                    {recipe.readyInMinutes} min
                  </span>
                )}
                {recipe.servings != null && (
                  <span className="rounded-full bg-kitchen-terracotta/15 px-3 py-1 font-medium text-kitchen-terracotta">
                    Serves {recipe.servings}
                  </span>
                )}
                {recipe.cuisines?.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="rounded-full bg-kitchen-cream px-3 py-1 font-medium text-kitchen-charcoal/70"
                  >
                    {cuisine}
                  </span>
                ))}
                {recipe.diets?.map((diet) => (
                  <span
                    key={diet}
                    className="rounded-full bg-kitchen-charcoal/10 px-3 py-1 font-medium text-kitchen-charcoal/70"
                  >
                    {diet}
                  </span>
                ))}
              </div>

              {recipe.summary && (
                <p className="mt-5 leading-relaxed text-kitchen-charcoal/80">
                  {stripHtml(recipe.summary)}
                </p>
              )}

              <section className="mt-6">
                <h3 className="text-lg font-semibold text-kitchen-charcoal">Ingredients</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {recipe.extendedIngredients?.map((ingredient) => (
                    <li
                      key={ingredient.id ?? ingredient.original}
                      className="rounded-xl bg-kitchen-cream/70 px-3 py-2 text-sm text-kitchen-charcoal/80"
                    >
                      {ingredient.original}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-6">
                <h3 className="text-lg font-semibold text-kitchen-charcoal">Instructions</h3>
                <ol className="mt-3 space-y-4">
                  {recipe.analyzedInstructions?.[0]?.steps?.map((step) => (
                    <li key={step.number} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kitchen-terracotta text-sm font-bold text-white">
                        {step.number}
                      </span>
                      <p className="pt-0.5 text-sm leading-relaxed text-kitchen-charcoal/80">
                        {step.step}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block text-sm font-semibold text-kitchen-terracotta underline"
                >
                  View original recipe
                </a>
              )}

              <ReviewSection recipeId={recipe.id} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
