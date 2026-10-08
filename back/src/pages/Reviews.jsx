import { useEffect, useState } from 'react'
import api from '../api/client.js'
import '../styles/Products.css'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'hidden', label: 'Hidden' },
]

const resolveImageUrl = (image) => {
  if (!image) return ''
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image
  }
  return `http://localhost:5000${image.startsWith('/') ? image : `/${image}`}`
}

function Stars({ rating }) {
  return (
    <span className="review-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className={`fa-star ${i < rating ? 'fa-solid' : 'fa-regular'}`}></i>
      ))}
    </span>
  )
}

function Reviews() {
  const [reviews, setReviews] = useState([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api
      .get('/reviews', statusFilter ? { status: statusFilter } : undefined)
      .then(setReviews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const setStatus = async (review, status) => {
    try {
      await api.patch(`/reviews/${review._id}/status`, { status })
      setReviews((prev) => prev.filter((r) => r._id !== review._id))
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (review) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return
    try {
      await api.del(`/reviews/${review._id}`)
      setReviews((prev) => prev.filter((r) => r._id !== review._id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="products-admin">
      <div className="products-toolbar-row">
        <h3 style={{ margin: 0 }}>Reviews</h3>
        <div className="tabs-row" style={{ border: 'none' }}>
          {STATUS_TABS.map((tab) => (
            <span
              key={tab.value}
              className={`tab${statusFilter === tab.value ? ' active' : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </span>
          ))}
        </div>
      </div>

      <div className="card products-table-card">
        {error && <p className="error-text" style={{ padding: '0 20px' }}>{error}</p>}
        {loading ? (
          <p className="muted-text" style={{ padding: '0 20px 20px' }}>Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="muted-text" style={{ padding: '20px' }}>
            No reviews {statusFilter ? `with status "${statusFilter}"` : ''} right now.
          </p>
        ) : (
          <div className="notification-list">
            {reviews.map((review) => (
              <div key={review._id} className="notification-row review-row">
                <div className="notification-icon">
                  <i className="fa-solid fa-star"></i>
                </div>
                <div className="notification-body">
                  <p className="notification-message">
                    <strong>{review.name}</strong> on{' '}
                    <strong>{review.product?.name || 'Unknown product'}</strong>
                  </p>
                  <Stars rating={review.rating} />
                  <p className="muted-text" style={{ margin: '4px 0' }}>{review.comment}</p>
                  {review.image && (
                    <img
                      src={resolveImageUrl(review.image)}
                      alt=""
                      className="review-thumb"
                    />
                  )}
                  <p className="muted-text">
                    {new Date(review.createdAt).toLocaleDateString()} · status: {review.status}
                  </p>
                </div>
                <div className="review-actions">
                  {review.status !== 'approved' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setStatus(review, 'approved')}>
                      Approve
                    </button>
                  )}
                  {review.status !== 'hidden' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setStatus(review, 'hidden')}>
                      Hide
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => remove(review)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reviews