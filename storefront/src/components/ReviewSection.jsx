import { useEffect, useRef, useState } from 'react'
import api from '../api/client.js'
import { ASSET_BASE_URL } from '../utils/apiBase.js'
import '../assets/styles/ReviewSection.css'

const resolveImageUrl = (image) => {
  if (!image) return ''
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image
  }
  if (image.startsWith('/')) return `${ASSET_BASE_URL}${image}`
  return `${ASSET_BASE_URL}/${image}`
}

function StarPicker({ value, onChange }) {
  return (
    <div className="review-star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? 'filled' : ''}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ReviewSection({ productId }) {
  const fileInputRef = useRef(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    api
      .get(`/reviews/product/${productId}`)
      .then((data) => {
        if (isMounted) setReviews(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [productId])

  const handleImagePick = () => fileInputRef.current?.click()

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFormError('')
    setUploading(true)
    try {
      const { url } = await api.uploadFile(file)
      setImage(url)
    } catch (err) {
      setFormError(err.message || 'Failed to upload image.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!name.trim() || !comment.trim()) {
      setFormError('Please add your name and a comment.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/reviews', {
        productId,
        name: name.trim(),
        rating,
        comment: comment.trim(),
        image,
      })
      setSubmitted(true)
      setShowForm(false)
      setName('')
      setRating(5)
      setComment('')
      setImage('')
    } catch (err) {
      setFormError(err.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="review-section">
      <div className="review-section-header">
        <h3>Customer Reviews {reviews.length > 0 && `(${reviews.length})`}</h3>
        {!showForm && !submitted && (
          <button type="button" className="detail-btn secondary" onClick={() => setShowForm(true)}>
            Write a review
          </button>
        )}
      </div>

      {submitted && (
        <p className="review-thanks">
          Thanks for your review! It will appear here once it's been approved.
        </p>
      )}

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Your rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className="field">
            <label>Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="field">
            <label>Your review</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of this product?"
              required
            />
          </div>

          <div className="field">
            <label>Photo (optional)</label>
            {image ? (
              <div className="review-image-preview">
                <img src={resolveImageUrl(image)} alt="" />
                <button type="button" onClick={() => setImage('')}>Remove</button>
              </div>
            ) : (
              <button
                type="button"
                className="detail-btn secondary"
                onClick={handleImagePick}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : 'Add a photo'}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          {formError && <p className="form-message form-error">{formError}</p>}

          <div className="review-form-actions">
            <button type="submit" className="detail-btn primary" disabled={submitting || uploading}>
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
            <button type="button" className="detail-btn secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="muted-text">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="muted-text">No reviews yet — be the first to share your experience.</p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-item-header">
                <span className="review-item-name">{review.name}</span>
                <span className="review-item-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < review.rating ? 'filled' : ''}>★</span>
                  ))}
                </span>
              </div>
              <p className="review-item-comment">{review.comment}</p>
              {review.image && (
                <img
                  src={resolveImageUrl(review.image)}
                  alt=""
                  className="review-item-image"
                />
              )}
              <span className="review-item-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewSection