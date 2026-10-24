import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../api/AuthContext.jsx'
import { resolveImageUrl } from '../utils/imageUrl.js'
import '../assets/styles/Community.css'

const PAGE_SIZE = 10
const MAX_REPLY = 500

const SORTS = [
    { value: 'recent', label: 'Newest' },
    { value: 'liked', label: 'Most liked' },
]
const RATING_FILTERS = ['', '5', '4', '3', '2', '1']

const Stars = ({ value }) => (
    <span className="rv-stars" aria-label={`${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= value ? 'filled' : ''}>★</span>)}
    </span>
)

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '')
const initialOf = (name) => (name || '?').trim().charAt(0).toUpperCase()

function ReviewCard({ review, signedIn, requireAuth, onPatch }) {
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    const author = review.author?.name || review.name || 'Customer'
    const product = review.product
    const replies = review.replies || []

    const toggleLike = async () => {
        if (!requireAuth('Create an account or sign in to like reviews.')) return
        const before = { likedByMe: Boolean(review.likedByMe), likesCount: review.likesCount || 0 }
        onPatch(review._id, (r) => ({
            ...r,
            likedByMe: !before.likedByMe,
            likesCount: Math.max(0, before.likesCount + (before.likedByMe ? -1 : 1)),
        }))
        try {
            const res = await api.post(`/reviews/${review._id}/like`, {})
            onPatch(review._id, (r) => ({ ...r, likedByMe: res.liked, likesCount: res.likesCount }))
        } catch {
            onPatch(review._id, (r) => ({ ...r, ...before }))
        }
    }

    const sendReply = async (event) => {
        event.preventDefault()
        if (!requireAuth('Create an account or sign in to reply.')) return
        const text = draft.trim()
        if (!text) return
        setSending(true)
        setError('')
        try {
            const reply = await api.post(`/reviews/${review._id}/replies`, { text })
            onPatch(review._id, (r) => ({ ...r, replies: [...(r.replies || []), reply] }))
            setDraft('')
        } catch (err) {
            setError(err.message || 'Could not send your reply.')
        } finally {
            setSending(false)
        }
    }

    const removeReply = async (reply) => {
        if (!window.confirm('Delete your reply?')) return
        try {
            await api.del(`/reviews/${review._id}/replies/${reply._id}`)
            onPatch(review._id, (r) => ({ ...r, replies: (r.replies || []).filter((x) => x._id !== reply._id) }))
        } catch (err) {
            setError(err.message || 'Could not delete the reply.')
        }
    }

    return (
        <article className="rv-card">
            <div className="rv-top">
                <span className="rv-avatar" aria-hidden="true">{initialOf(author)}</span>
                <div className="rv-who">
                    <strong>{author}</strong>
                    <span className="cm-muted">{formatDate(review.createdAt)}</span>
                </div>
                <Stars value={review.rating} />
            </div>

            {product && (
                <Link className="rv-product" to={`/products/${product._id}`}>
                    <img src={resolveImageUrl(product.image)} alt="" loading="lazy" />
                    <span className="rv-product-info">
                        <strong>{product.name}</strong>
                        <span className="cm-muted">
                            {[product.brand, product.price != null ? `DH ${Number(product.price).toFixed(2)}` : '']
                                .filter(Boolean).join(' · ')}
                        </span>
                    </span>
                    <i className="fa-solid fa-arrow-right"></i>
                </Link>
            )}

            <p className="rv-comment">{review.comment}</p>
            {review.image && <img className="rv-photo" src={resolveImageUrl(review.image, '')} alt="" loading="lazy" />}

            <div className="rv-actions">
                <button type="button" className={`rv-action${review.likedByMe ? ' on' : ''}`} onClick={toggleLike}>
                    <i className={`${review.likedByMe ? 'fa-solid' : 'fa-regular'} fa-thumbs-up`}></i>
                    Helpful{review.likesCount > 0 ? ` (${review.likesCount})` : ''}
                </button>
                <button type="button" className={`rv-action${open ? ' on' : ''}`} onClick={() => setOpen((v) => !v)}>
                    <i className="fa-regular fa-comment"></i>
                    {replies.length > 0 ? `${replies.length} repl${replies.length > 1 ? 'ies' : 'y'}` : 'Reply'}
                </button>
            </div>

            {open && (
                <div className="rv-thread">
                    {replies.map((reply) => (
                        <div className={`rv-reply${reply.isStaff ? ' staff' : ''}`} key={reply._id}>
                            <span className="rv-avatar small" aria-hidden="true">{initialOf(reply.user?.name)}</span>
                            <div className="rv-reply-body">
                                <div className="rv-reply-head">
                                    <strong>{reply.user?.name || 'Customer'}</strong>
                                    {reply.isStaff && <span className="rv-staff-badge">Eco&amp;Bio team</span>}
                                    <span className="cm-muted">{formatDate(reply.createdAt)}</span>
                                    {reply.mine && (
                                        <button type="button" className="rv-delete" onClick={() => removeReply(reply)} aria-label="Delete reply">
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    )}
                                </div>
                                <p>{reply.text}</p>
                            </div>
                        </div>
                    ))}

                    {signedIn ? (
                        <form className="rv-reply-form" onSubmit={sendReply}>
                            <textarea
                                rows={2}
                                maxLength={MAX_REPLY}
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Write a reply…"
                            />
                            <button type="submit" className="cm-btn small" disabled={sending || !draft.trim()}>
                                {sending ? 'Sending…' : 'Reply'}
                            </button>
                        </form>
                    ) : (
                        <button type="button" className="cm-btn ghost small" onClick={() => requireAuth('Create an account or sign in to reply.')}>
                            Sign in to reply
                        </button>
                    )}
                    {error && <p className="rv-error">{error}</p>}
                </div>
            )}
        </article>
    )
}

function Reviews() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const signedIn = Boolean(user)

    const [reviews, setReviews] = useState([])
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [summary, setSummary] = useState({ total: 0, average: null })
    const [sort, setSort] = useState('recent')
    const [rating, setRating] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState('')

    const load = useCallback(async (pageNum, replace) => {
        if (pageNum === 1) setLoading(true)
        else setLoadingMore(true)
        try {
            const data = await api.get('/reviews/feed', { page: pageNum, limit: PAGE_SIZE, sort, rating })
            const list = Array.isArray(data?.reviews) ? data.reviews : []
            setReviews((prev) => (replace ? list : [...prev, ...list]))
            setPage(data?.page || pageNum)
            setPages(data?.pages || 1)
            setSummary({ total: data?.total ?? list.length, average: data?.averageRating ?? null })
            setError('')
        } catch (err) {
            setError(err.message || 'Could not load reviews.')
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [sort, rating])

    // reload when filters change or when the visitor signs in/out (likedByMe changes)
    useEffect(() => { load(1, true) }, [load, signedIn])

    const patchReview = useCallback((id, updater) => {
        setReviews((prev) => prev.map((r) => (r._id === id ? updater(r) : r)))
    }, [])

    const requireAuth = useCallback((notice) => {
        if (signedIn) return true
        navigate('/account', { state: { from: location.pathname, mode: 'register', notice } })
        return false
    }, [signedIn, navigate, location.pathname])

    return (
        <main className="community-page">
            <div className="cm-header">
                <span className="cm-eyebrow">Community</span>
                <h1>Customer reviews</h1>
                <p className="cm-muted">
                    Real opinions from Eco&amp;Bio customers. Like a review, join the conversation, and get answers from our team.
                </p>
                {!loading && !error && (
                    <div className="rv-summary">
                        <span><strong>{summary.total}</strong> review{summary.total === 1 ? '' : 's'}</span>
                        {summary.average != null && (
                            <span><strong>{Number(summary.average).toFixed(1)}</strong> <span className="rv-stars"><span className="filled">★</span></span> average</span>
                        )}
                    </div>
                )}
            </div>

            <div className="rv-toolbar">
                <div className="rv-chips" role="group" aria-label="Filter by rating">
                    {RATING_FILTERS.map((value) => (
                        <button
                            key={value || 'all'}
                            type="button"
                            className={`rv-chip${rating === value ? ' on' : ''}`}
                            onClick={() => setRating(value)}
                        >
                            {value ? `${value} ★` : 'All'}
                        </button>
                    ))}
                </div>
                <select className="rv-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort reviews">
                    {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            {loading ? (
                <p className="cm-muted">Loading reviews…</p>
            ) : error ? (
                <div className="cm-empty">
                    <p>{error}</p>
                    <div className="cm-empty-actions">
                        <button type="button" className="cm-btn" onClick={() => load(1, true)}>Try again</button>
                    </div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="cm-empty">
                    <i className="fa-regular fa-comment cm-empty-icon"></i>
                    <h2>No reviews yet</h2>
                    <p>Open any product and share your experience to be the first.</p>
                    <div className="cm-empty-actions">
                        <Link className="cm-btn" to="/products">Browse products</Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="rv-list">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review._id}
                                review={review}
                                signedIn={signedIn}
                                requireAuth={requireAuth}
                                onPatch={patchReview}
                            />
                        ))}
                    </div>
                    {page < pages && (
                        <div className="cm-empty-actions center">
                            <button type="button" className="cm-btn ghost" disabled={loadingMore} onClick={() => load(page + 1, false)}>
                                {loadingMore ? 'Loading…' : 'Load more reviews'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    )
}

export default Reviews
