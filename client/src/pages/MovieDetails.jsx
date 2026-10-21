import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { renderStars } from '../utils/stars';
import './MovieDetails.css';

const POSTER_BASE   = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

const StarRating = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  const handleMouseMove = (e, s) => {
    const { left, width } = e.target.getBoundingClientRect();
    const isLeftHalf = e.clientX - left < width / 2;
    setHover(isLeftHalf ? s - 0.5 : s);
  };

  return (
    <div className="star-picker">
      {stars.map(s => {
        const current = hover || value;
        let className = 'star-btn';
        if (current >= s) className += ' active';
        else if (current >= s - 0.5) className += ' half-active';
        return (
          <button
            key={s}
            type="button"
            className={className}
            onMouseMove={(e) => handleMouseMove(e, s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(hover || value)}
          >★</button>
        );
      })}
      {value > 0 && <span className="rating-label">{value}/5</span>}
    </div>
  );
};

const MovieDetails = () => {
  const { tmdbId } = useParams();
  const { user }   = useAuth();

  const [movie, setMovie]       = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const [inWatchlist, setInWatchlist] = useState(false);
  const [wlLoading, setWlLoading]     = useState(false);
  const [isFavorite, setIsFavorite]   = useState(false);
  const [favLoading, setFavLoading]   = useState(false);

  const [rating, setRating]     = useState(0);
  const [content, setContent]   = useState('');
  const [submitting, setSub]    = useState(false);
  const [reviewError, setRevErr]= useState('');

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editContent, setEditContent] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // ── Diary log state ──
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate]           = useState(new Date().toISOString().slice(0, 10));
  const [logRating, setLogRating]       = useState(0);
  const [logReview, setLogReview]       = useState('');
  const [logRewatch, setLogRewatch]     = useState(false);
  const [logSubmitting, setLogSub]      = useState(false);
  const [logError, setLogError]         = useState('');
  const [logSuccess, setLogSuccess]     = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [{ data: m }, { data: r }] = await Promise.all([
        api.get(`/movies/${tmdbId}`),
        api.get(`/reviews/movie/${tmdbId}`),
      ]);
      setMovie(m);
      setReviews(r);
      setLoading(false);
    };
    fetchAll().catch(() => setLoading(false));
  }, [tmdbId]);

  useEffect(() => {
    if (!user) return;
    const checkStatus = async () => {
      try {
        const { data: wlData } = await api.get('/watchlist');
        setInWatchlist(wlData.some(w => w.tmdbId === parseInt(tmdbId)));
        const { data: userData } = await api.get(`/users/${user.username}`);
        setIsFavorite(userData.favorites?.some(f => f.tmdbId === parseInt(tmdbId)));
      } catch (err) {}
    };
    checkStatus();
  }, [user, tmdbId]);

  const toggleWatchlist = async () => {
    if (!user) return;
    setWlLoading(true);
    try {
      if (inWatchlist) {
        await api.delete(`/watchlist/${tmdbId}`);
        setInWatchlist(false);
      } else {
        await api.post('/watchlist', {
          tmdbId: movie.id,
          movieTitle: movie.title,
          posterPath: movie.poster_path || '',
          releaseDate: movie.release_date || '',
        });
        setInWatchlist(true);
      }
    } finally { setWlLoading(false); }
  };

  const toggleFavorite = async () => {
    if (!user) return;
    setFavLoading(true);
    try {
      const { data } = await api.post('/users/favorites', {
        tmdbId: movie.id,
        movieTitle: movie.title,
        posterPath: movie.poster_path || '',
      });
      setIsFavorite(data.favorites.some(f => f.tmdbId === parseInt(tmdbId)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update favorites');
    } finally {
      setFavLoading(false);
    }
  };

  // ── Log to Diary ──
  const openLogModal = () => {
    setLogDate(new Date().toISOString().slice(0, 10));
    setLogRating(0);
    setLogReview('');
    setLogRewatch(false);
    setLogError('');
    setLogSuccess(false);
    setShowLogModal(true);
  };

  const submitLog = async (e) => {
    e.preventDefault();
    setLogSub(true);
    setLogError('');
    try {
      await api.post('/diary', {
        tmdbId: movie.id,
        movieTitle: movie.title,
        posterPath: movie.poster_path || '',
        releaseDate: movie.release_date || '',
        watchedOn: logDate,
        rating: logRating || null,
        review: logReview,
        rewatch: logRewatch,
      });
      setLogSuccess(true);
      setTimeout(() => setShowLogModal(false), 1200);
    } catch (err) {
      setLogError(err.response?.data?.message || 'Failed to log film');
    } finally {
      setLogSub(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating) { setRevErr('Please select a rating'); return; }
    setSub(true); setRevErr('');
    try {
      const { data } = await api.post('/reviews', {
        tmdbId: movie.id,
        movieTitle: movie.title,
        posterPath: movie.poster_path || '',
        rating,
        content,
      });
      setReviews([data, ...reviews]);
      setRating(0); setContent('');
    } catch (err) {
      setRevErr(err.response?.data?.message || 'Failed to submit');
    } finally { setSub(false); }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditContent(review.content);
    setEditError('');
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditContent('');
    setEditError('');
  };

  const submitEditReview = async (e, reviewId) => {
    e.preventDefault();
    if (!editRating) { setEditError('Please select a rating'); return; }
    setEditSubmitting(true); setEditError('');
    try {
      const { data } = await api.put(`/reviews/${reviewId}`, {
        rating: editRating,
        content: editContent,
      });
      setReviews(reviews.map(r => r._id === reviewId ? data : r));
      cancelEditReview();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to edit review');
    } finally {
      setEditSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!movie)  return <div className="page container"><p>Movie not found.</p></div>;

  const year = movie.release_date?.slice(0, 4);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <div className="movie-detail-page">
      {/* Backdrop */}
      {movie.backdrop_path && (
        <div
          className="detail-backdrop"
          style={{ backgroundImage: `url(${BACKDROP_BASE}${movie.backdrop_path})` }}
        >
          <div className="detail-backdrop-overlay" />
        </div>
      )}

      <div className="container detail-body">
        {/* Info Row */}
        <div className="detail-info">
          <div className="detail-poster">
            {movie.poster_path ? (
              <img src={`${POSTER_BASE}${movie.poster_path}`} alt={movie.title} />
            ) : (
              <div className="poster-placeholder">🎬</div>
            )}
          </div>
          <div className="detail-meta">
            <h1 className="detail-title">{movie.title}</h1>
            <div className="detail-sub">
              {year && <span>{year}</span>}
              {runtime && <><span className="dot">·</span><span>{runtime}</span></>}
              {movie.vote_average > 0 && (
                <><span className="dot">·</span><span className="tmdb-rating">⭐ {movie.vote_average.toFixed(1)}</span></>
              )}
            </div>

            {movie.genres?.length > 0 && (
              <div className="detail-genres">
                {movie.genres.map(g => (
                  <span key={g.id} className="badge">{g.name}</span>
                ))}
              </div>
            )}

            {movie.overview && <p className="detail-overview">{movie.overview}</p>}

            <div className="detail-actions">
              {user ? (
                <>
                  <button
                    id="log-btn"
                    className="btn btn-primary"
                    onClick={openLogModal}
                  >
                    📖 Log to Diary
                  </button>
                  <button
                    className={`btn ${isFavorite ? 'btn-danger' : 'btn-ghost'}`}
                    onClick={toggleFavorite}
                    disabled={favLoading}
                    style={{ padding: '8px 12px' }}
                  >
                    {isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
                  </button>
                  <button
                    id="watchlist-btn"
                    className={`btn ${inWatchlist ? 'btn-danger' : 'btn-ghost'}`}
                    onClick={toggleWatchlist}
                    disabled={wlLoading}
                  >
                    {inWatchlist ? '✕ Remove from Watchlist' : '+ Add to Watchlist'}
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-ghost">Sign in to track films</Link>
              )}
            </div>
          </div>
        </div>

        {/* Cast */}
        {movie.credits?.cast?.length > 0 && (
          <section className="detail-section">
            <h2 className="section-heading">Cast</h2>
            <div className="cast-scroll">
              {movie.credits.cast.slice(0, 12).map(c => (
                <Link key={c.id} to={`/person/${c.id}`} className="cast-card">
                  <div className="cast-photo">
                    {c.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                        alt={c.name}
                      />
                    ) : (
                      <div className="cast-placeholder">👤</div>
                    )}
                  </div>
                  <div className="cast-name">{c.name}</div>
                  <div className="cast-char">{c.character}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="detail-section">
          <h2 className="section-heading">Reviews ({reviews.length})</h2>

          {user && (
            <form className="review-form card" onSubmit={submitReview}>
              <h3 className="review-form-title">Write a Review</h3>
              <StarRating value={rating} onChange={setRating} />
              <textarea
                className="form-input"
                placeholder="Share your thoughts… (optional)"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
              />
              {reviewError && <p className="error-msg">{reviewError}</p>}
              <button
                type="submit"
                id="submit-review-btn"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3>No reviews yet</h3>
                <p>Be the first to write one!</p>
              </div>
            ) : (
              reviews.map(r => (
                <div key={r._id} className="review-card card">
                  {editingReviewId === r._id ? (
                    <form className="review-form" onSubmit={(e) => submitEditReview(e, r._id)} style={{ padding: 0, boxShadow: 'none' }}>
                      <StarRating value={editRating} onChange={setEditRating} />
                      <textarea
                        className="form-input"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={3}
                        style={{ marginTop: '10px' }}
                      />
                      {editError && <p className="error-msg">{editError}</p>}
                      <div className="log-actions" style={{ marginTop: '10px' }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEditReview}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={editSubmitting}>
                          {editSubmitting ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="review-header">
                        <Link to={`/users/${r.user?.username}`} className="review-author">
                          <div className="review-avatar">{r.user?.username?.[0]?.toUpperCase()}</div>
                          <span>{r.user?.username}</span>
                        </Link>
                        <div className="review-actions">
                          <div className="review-rating">
                            {renderStars(r.rating)}
                          </div>
                          {user && user._id === r.user?._id && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {!r.isEdited && (
                                <button className="btn btn-ghost btn-sm" onClick={() => startEditReview(r)}>
                                  Edit
                                </button>
                              )}
                              <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r._id)}>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {r.content && <p className="review-content">{r.content}</p>}
                      <div className="review-date">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
                        {r.isEdited && <span style={{ marginLeft: '8px', fontSize: '0.8rem', opacity: 0.7 }}>(Edited)</span>}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Log to Diary Modal ── */}
      {showLogModal && (
        <div className="log-overlay" onClick={() => setShowLogModal(false)}>
          <div className="log-modal card" onClick={e => e.stopPropagation()}>
            {logSuccess ? (
              <div className="log-success">
                <div className="log-success-icon">✅</div>
                <h3>Logged!</h3>
                <p>{movie.title} added to your diary</p>
              </div>
            ) : (
              <form onSubmit={submitLog}>
                <h3 className="log-modal-title">Log <em>{movie.title}</em></h3>

                <label className="log-label">Date watched</label>
                <input
                  id="log-date"
                  type="date"
                  className="form-input"
                  value={logDate}
                  min={movie.release_date}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={e => setLogDate(e.target.value)}
                  required
                />

                <label className="log-label">Rating</label>
                <StarRating value={logRating} onChange={setLogRating} />

                <label className="log-label">Review (optional)</label>
                <textarea
                  id="log-review"
                  className="form-input"
                  placeholder="What did you think?"
                  value={logReview}
                  onChange={e => setLogReview(e.target.value)}
                  rows={3}
                />

                <label className="log-checkbox">
                  <input
                    type="checkbox"
                    checked={logRewatch}
                    onChange={e => setLogRewatch(e.target.checked)}
                  />
                  <span>I've seen this film before</span>
                </label>

                {logError && <p className="error-msg">{logError}</p>}

                <div className="log-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowLogModal(false)}
                  >Cancel</button>
                  <button
                    type="submit"
                    id="submit-log-btn"
                    className="btn btn-primary"
                    disabled={logSubmitting}
                  >
                    {logSubmitting ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
