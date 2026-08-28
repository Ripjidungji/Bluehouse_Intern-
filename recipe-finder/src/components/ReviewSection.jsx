import { useState } from 'react'
import { useRecipeReviews } from '../hooks/useRecipeReviews'

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`text-xl transition ${star <= value ? 'text-kitchen-terracotta' : 'text-gray-300'} ${readOnly ? 'cursor-default' : 'hover:scale-110'}`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ReviewSection({ recipeId }) {
  const { reviews, addReview, avgRating } = useRecipeReviews(recipeId)
  const [author, setAuthor] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!author.trim() || !comment.trim()) return

    addReview({ author, rating, comment })
    setAuthor('')
    setRating(5)
    setComment('')
  }

  return (
    <section className="mt-8 border-t border-kitchen-cream pt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-kitchen-charcoal">Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-kitchen-charcoal/70">
            <StarRating value={Math.round(avgRating)} readOnly />
            <span>
              {avgRating.toFixed(1)} ({reviews.length})
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-kitchen-cream/60 p-4">
        <input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm outline-none focus:border-kitchen-sage"
        />
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-kitchen-charcoal/60">
            Rating
          </p>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share how this recipe turned out…"
          rows={3}
          className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm outline-none focus:border-kitchen-sage"
        />
        <button
          type="submit"
          disabled={!author.trim() || !comment.trim()}
          className="rounded-xl bg-kitchen-sage px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Post review
        </button>
      </form>

      <div className="mt-5 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-kitchen-charcoal/60">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-kitchen-cream bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-kitchen-charcoal">{review.author}</p>
                <StarRating value={review.rating} readOnly />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-kitchen-charcoal/80">{review.comment}</p>
              <p className="mt-2 text-xs text-kitchen-charcoal/50">
                {new Date(review.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
