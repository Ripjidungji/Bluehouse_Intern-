import { useEffect, useState } from 'react'

const STORAGE_KEY = 'recipe-reviews'

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function useRecipeReviews(recipeId) {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (!recipeId) {
      setReviews([])
      return
    }
    const all = loadAll()
    setReviews(all[String(recipeId)] ?? [])
  }, [recipeId])

  function addReview({ author, rating, comment }) {
    const entry = {
      id: crypto.randomUUID(),
      author: author.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      date: new Date().toISOString(),
    }

    const all = loadAll()
    const key = String(recipeId)
    const updated = [entry, ...(all[key] ?? [])]
    all[key] = updated
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    setReviews(updated)
  }

  const avgRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return { reviews, addReview, avgRating }
}
