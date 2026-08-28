import RecipeCard from './RecipeCard'

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-md">
      <div className="aspect-[4/3] animate-pulse bg-kitchen-cream" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-kitchen-cream" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-kitchen-cream" />
      </div>
    </div>
  )
}

export default function RecipeGrid({
  results,
  searchMode,
  loading,
  onRecipeClick,
  openingId,
}) {
  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {results.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          searchMode={searchMode}
          onClick={onRecipeClick}
          loading={openingId === recipe.id}
        />
      ))}
    </div>
  )
}
