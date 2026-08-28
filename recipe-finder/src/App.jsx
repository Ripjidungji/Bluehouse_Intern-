import { useState } from 'react'
import {
  getRandomRecipe,
  getRecipeDetails,
  hasApiKey,
  searchByIngredients,
  searchRecipes,
} from './api/spoonacular'
import EmptyState from './components/EmptyState'
import Header from './components/Header'
import RecipeGrid from './components/RecipeGrid'
import RecipeModal from './components/RecipeModal'
import SearchBar from './components/SearchBar'

export default function App() {
  const [query, setQuery] = useState('')
  const [searchMode, setSearchMode] = useState('recipes')
  const [country, setCountry] = useState('all')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [openingId, setOpeningId] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const data =
        searchMode === 'recipes'
          ? await searchRecipes(query.trim(), country)
          : await searchByIngredients(query.trim())
      setResults(data)
    } catch (err) {
      setResults([])
      setError(err.message || 'Something went wrong while searching.')
    } finally {
      setLoading(false)
    }
  }

  async function openRecipe(id) {
    setModalOpen(true)
    setModalLoading(true)
    setOpeningId(id)
    setSelectedRecipe(null)
    setError('')

    try {
      const details = await getRecipeDetails(id)
      setSelectedRecipe(details)
    } catch (err) {
      setModalOpen(false)
      setError(err.message || 'Could not load recipe details.')
    } finally {
      setModalLoading(false)
      setOpeningId(null)
    }
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedRecipe(null)
    setModalLoading(false)
  }

  async function handleSurpriseMe() {
    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const recipe = await getRandomRecipe()
      if (!recipe) throw new Error('No random recipe found.')
      setResults([recipe])
      await openRecipe(recipe.id)
    } catch (err) {
      setError(err.message || 'Could not fetch a random recipe.')
    } finally {
      setLoading(false)
    }
  }

  if (!hasApiKey()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F4E4D4] to-[#E8F5E9] px-4 py-16">
        <EmptyState
          title="API key required"
          message="Copy .env.example to .env and add your Spoonacular API key as VITE_SPOONACULAR_API_KEY, then restart the dev server."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F4E4D4] to-[#E8F5E9]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(224,122,95,0.15),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(129,178,154,0.2),transparent_50%)]" />

      <div className="relative z-10">
        <Header onSurprise={handleSurpriseMe} loading={loading} />
        <SearchBar
          query={query}
          setQuery={setQuery}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          country={country}
          setCountry={setCountry}
          onSearch={handleSearch}
          loading={loading}
        />

        {error && (
          <p className="mx-auto mb-6 max-w-3xl rounded-2xl border border-kitchen-terracotta/20 bg-white/80 px-4 py-3 text-center text-sm text-kitchen-terracotta">
            {error}
          </p>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <EmptyState
            title="No recipes found"
            message="Try a different search term or switch between recipe and ingredient modes."
          />
        )}

        {!hasSearched && !loading && (
          <EmptyState
            title="Start cooking"
            message="Search for a dish by name, enter ingredients from your fridge, or hit Surprise me for inspiration."
            actionLabel="Surprise me"
            onAction={handleSurpriseMe}
          />
        )}

        {(loading || results.length > 0) && (
          <RecipeGrid
            results={results}
            searchMode={searchMode}
            loading={loading}
            onRecipeClick={openRecipe}
            openingId={openingId}
          />
        )}

        {modalOpen && (
          <RecipeModal recipe={selectedRecipe} onClose={closeModal} loading={modalLoading} />
        )}
      </div>
    </div>
  )
}
