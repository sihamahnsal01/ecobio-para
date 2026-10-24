import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import { resolveImageUrl } from '../../utils/imageUrl.js'
import { REVIEW_STATUS, formatDate } from './accountUtils.js'

const MAX_REPLY = 500

function StarPicker({ value, onChange }) {
    return (
        <div className="acc-star-picker" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    className={n <= value ? 'on' : ''}
                    onClick={() => onChange(n)}
                >★</button>
            ))}
        </div>
    )
}

const Stars = ({ value }) => (
    <span className="acc-stars" aria-label={`${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= value ? 'on' : ''}>★</span>)}
    </span>
)

function ReviewItem({ review, onChange, onRemove }) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState({ rating: review.rating, comment: review.comment })
    const [confirming, setConfirming] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const status = REVIEW_STATUS[review.status] || REVIEW_STATUS.pending

    const save = async (event) => {
        event.preventDefault()
        if (!draft.comment.trim()) return setError('Your review cannot be empty.')
        setBusy(true)
        setError('')
        try {
            const updated = await api.put(`/reviews/mine/${review._id}`, draft)
            onChange({ ...review, ...updated })
            setEditing(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    const remove = async () => {
        setBusy(true)
        try {
            await api.del(`/reviews/mine/${review._id}`)
            onRemove(review._id)
        } catch (err) {
            setError(err.message)
            setBusy(false)
        }
    }

    return (
        <article className="acc-card acc-review">
            <div className="acc-review-top">
                {review.product && (
                    <Link to={`/products/${review.product._id}`} className="acc-review-product">
                        <img src={resolveImageUrl(review.product.image)} alt="" loading="lazy" />
                        <span>{review.product.name}</span>
                    </Link>
                )}
                <span className={`acc-badge ${status.tone}`}>{status.label}</span>
            </div>

            {editing ? (
                <form className="acc-review-edit" onSubmit={save}>
                    <StarPicker value={draft.rating} onChange={(rating) => setDraft((d) => ({ ...d, rating }))} />
                    <textarea
                        rows="4"
                        value={draft.comment}
                        onChange={(e) => setDraft((d) => ({ ...d, comment: e.target.value }))}
                        aria-label="Your review"
                    />
                    <p className="acc-hint">Edited reviews are checked again by our team before they appear in the shop.</p>
                    {error && <p className="acc-alert danger">{error}</p>}
                    <div className="acc-row-actions">
                        <button className="acc-btn small" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
                        <button
                            type="button"
                            className="acc-btn ghost small"
                            onClick={() => { setEditing(false); setDraft({ rating: review.rating, comment: review.comment }); setError('') }}
                        >Cancel</button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="acc-review-meta">
                        <Stars value={review.rating} />
                        <span className="acc-muted">{formatDate(review.createdAt)}</span>
                        {review.likesCount > 0 && <span className="acc-muted"><i className="fa-regular fa-thumbs-up"></i> {review.likesCount}</span>}
                    </div>
                    <p className="acc-review-text">{review.comment}</p>
                    {review.image && <img className="acc-review-photo" src={resolveImageUrl(review.image)} alt="Attached to your review" loading="lazy" />}

                    {review.replies?.length > 0 && (
                        <ul className="acc-replies">
                            {review.replies.map((reply) => (
                                <li key={reply._id} className={reply.isStaff ? 'staff' : ''}>
                                    <strong>{reply.isStaff ? 'Eco&Bio team' : reply.user?.name}</strong>
                                    <span className="acc-muted"> · {formatDate(reply.createdAt)}</span>
                                    <p>{reply.text}</p>
                                </li>
                            ))}
                        </ul>
                    )}

                    {error && <p className="acc-alert danger">{error}</p>}
                    <div className="acc-row-actions">
                        {!confirming ? (
                            <>
                                <button type="button" className="acc-btn ghost small" onClick={() => setEditing(true)}>
                                    <i className="fa-regular fa-pen-to-square"></i> Edit
                                </button>
                                <button type="button" className="acc-btn danger-ghost small" onClick={() => setConfirming(true)}>
                                    <i className="fa-regular fa-trash-can"></i> Delete
                                </button>
                            </>
                        ) : (
                            <div className="acc-confirm">
                                <span>Delete this review?</span>
                                <button type="button" className="acc-btn danger small" disabled={busy} onClick={remove}>Delete</button>
                                <button type="button" className="acc-btn ghost small" onClick={() => setConfirming(false)}>Keep</button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </article>
    )
}

function ReplyItem({ reply, onChange, onRemove }) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(reply.text)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const save = async (event) => {
        event.preventDefault()
        const text = draft.trim()
        if (!text) return setError('Your comment cannot be empty.')
        setBusy(true)
        setError('')
        try {
            const updated = await api.put(`/reviews/${reply.review._id}/replies/${reply._id}`, { text })
            onChange({ ...reply, text: updated.text })
            setEditing(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    const remove = async () => {
        setBusy(true)
        try {
            await api.del(`/reviews/${reply.review._id}/replies/${reply._id}`)
            onRemove(reply._id)
        } catch (err) {
            setError(err.message)
            setBusy(false)
        }
    }

    return (
        <article className="acc-card acc-reply">
            <p className="acc-muted acc-reply-context">
                On {reply.review.author}'s review{reply.product ? <> of <Link to={`/products/${reply.product._id}`}>{reply.product.name}</Link></> : null}
                {' · '}{formatDate(reply.createdAt)}
            </p>
            <blockquote>“{reply.review.comment}”</blockquote>
            {editing ? (
                <form onSubmit={save} className="acc-review-edit">
                    <textarea rows="3" maxLength={MAX_REPLY} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Your comment" />
                    <p className="acc-hint">{draft.length}/{MAX_REPLY}</p>
                    {error && <p className="acc-alert danger">{error}</p>}
                    <div className="acc-row-actions">
                        <button className="acc-btn small" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
                        <button type="button" className="acc-btn ghost small" onClick={() => { setEditing(false); setDraft(reply.text) }}>Cancel</button>
                    </div>
                </form>
            ) : (
                <>
                    <p className="acc-review-text">{reply.text}</p>
                    {error && <p className="acc-alert danger">{error}</p>}
                    <div className="acc-row-actions">
                        <button type="button" className="acc-btn ghost small" onClick={() => setEditing(true)}>
                            <i className="fa-regular fa-pen-to-square"></i> Edit
                        </button>
                        <button type="button" className="acc-btn danger-ghost small" disabled={busy} onClick={remove}>
                            <i className="fa-regular fa-trash-can"></i> Delete
                        </button>
                    </div>
                </>
            )}
        </article>
    )
}

function ReviewsTab() {
    const [data, setData] = useState(null)
    const [error, setError] = useState('')
    const [view, setView] = useState('reviews')

    useEffect(() => {
        api.get('/reviews/mine')
            .then((d) => setData({ reviews: d?.reviews || [], replies: d?.replies || [] }))
            .catch((err) => setError(err.message || 'Unable to load your reviews'))
    }, [])

    const patch = (key) => (updated) =>
        setData((d) => ({ ...d, [key]: d[key].map((x) => (x._id === updated._id ? updated : x)) }))
    const drop = (key) => (id) => setData((d) => ({ ...d, [key]: d[key].filter((x) => x._id !== id) }))

    const list = data?.[view] || []

    return (
        <>
            <div className="acc-head">
                <div>
                    <span className="acc-eyebrow">Community</span>
                    <h1>Reviews &amp; comments</h1>
                    <p className="acc-muted">Edit or delete what you have written about our products.</p>
                </div>
                <Link className="acc-btn ghost" to="/reviews">All customer reviews</Link>
            </div>

            {data && (
                <div className="acc-filters" role="tablist">
                    <button type="button" role="tab" aria-selected={view === 'reviews'} className={view === 'reviews' ? 'on' : ''} onClick={() => setView('reviews')}>
                        My reviews <span>{data.reviews.length}</span>
                    </button>
                    <button type="button" role="tab" aria-selected={view === 'replies'} className={view === 'replies' ? 'on' : ''} onClick={() => setView('replies')}>
                        My replies <span>{data.replies.length}</span>
                    </button>
                </div>
            )}

            {error && <p className="acc-alert danger">{error}</p>}
            {!error && !data && <p className="acc-muted">Loading…</p>}

            {data && list.length === 0 && (
                <div className="acc-empty">
                    <i className="fa-regular fa-comment"></i>
                    <h2>{view === 'reviews' ? 'You have not reviewed any product yet' : 'You have not replied to any review yet'}</h2>
                    <p className="acc-muted">
                        {view === 'reviews' ? 'Open a product you bought and share your experience.' : 'Join the conversation on the customer reviews page.'}
                    </p>
                    <Link className="acc-btn" to={view === 'reviews' ? '/products' : '/reviews'}>
                        {view === 'reviews' ? 'Browse products' : 'Read reviews'}
                    </Link>
                </div>
            )}

            <div className="acc-stack">
                {view === 'reviews'
                    ? list.map((review) => <ReviewItem key={review._id} review={review} onChange={patch('reviews')} onRemove={drop('reviews')} />)
                    : list.map((reply) => <ReplyItem key={reply._id} reply={reply} onChange={patch('replies')} onRemove={drop('replies')} />)}
            </div>
        </>
    )
}

export default ReviewsTab
