import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Watchlist.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

const Watchlist = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/watchlist')
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const remove = async (tmdbId) => {
    try {
      await api.delete(`/watchlist/${tmdbId}`);
      setItems(items.filter(i => i.tmdbId !== tmdbId));
    } catch { /* Silently ignore */ }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Watchlist</h1>
          <p className="page-subtitle">{items.length} film{items.length !== 1 ? 's' : ''} to watch</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Your watchlist is empty</h3>
            <p>Find a movie you want to watch and add it here</p>
            <Link to="/discover" className="btn btn-primary" style={{ marginTop: 20 }}>
              Discover Films
            </Link>
          </div>
        ) : (
          <div className="watchlist-grid">
            {items.map(item => (
              <div key={item._id} className="wl-card card">
                <Link to={`/movies/${item.tmdbId}`} className="wl-poster">
                  {item.posterPath ? (
                    <img src={`${POSTER_BASE}${item.posterPath}`} alt={item.movieTitle} loading="lazy" />
                  ) : (
                    <div className="wl-no-poster">🎬</div>
                  )}
                </Link>
                <div className="wl-info">
                  <Link to={`/movies/${item.tmdbId}`} className="wl-title">{item.movieTitle}</Link>
                  {item.releaseDate && (
                    <div className="wl-year">{item.releaseDate.slice(0,4)}</div>
                  )}
                  <div className="wl-added">
                    Added {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <button
                  id={`remove-wl-${item.tmdbId}`}
                  className="wl-remove btn btn-danger"
                  onClick={() => remove(item.tmdbId)}
                  title="Remove from watchlist"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
