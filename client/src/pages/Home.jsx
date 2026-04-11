import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Home.css';

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const POSTER_BASE   = 'https://image.tmdb.org/t/p/w342';

const MovieCard = ({ movie }) => (
  <Link to={`/movies/${movie.id}`} className="movie-poster-card">
    {movie.poster_path ? (
      <img src={`${POSTER_BASE}${movie.poster_path}`} alt={movie.title} loading="lazy" />
    ) : (
      <div className="no-poster">🎬</div>
    )}
    <div className="overlay">
      <span className="overlay-title">{movie.title}</span>
    </div>
  </Link>
);

const Home = () => {
  const [trending, setTrending]   = useState([]);
  const [hero, setHero]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    api.get('/movies/trending')
      .then(({ data }) => {
        const results = data.results || [];
        setTrending(results.slice(1));
        setHero(results[0] || null);
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Could not connect to movie database.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40 }}>
      <div style={{ fontSize: '3rem' }}>📡</div>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>Can't reach TMDB</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 480, textAlign: 'center', lineHeight: 1.7 }}>
        {error}
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Make sure your machine can access <code>api.themoviedb.org</code> (check firewall / VPN settings).</p>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      {hero && (
        <section
          className="hero"
          style={{ backgroundImage: `url(${BACKDROP_BASE}${hero.backdrop_path})` }}
        >
          <div className="hero-overlay" />
          <div className="hero-content container">
            <div className="hero-badge">🔥 Trending This Week</div>
            <h1 className="hero-title">{hero.title}</h1>
            <p className="hero-overview">{hero.overview?.slice(0, 200)}…</p>
            <div className="hero-actions">
              <Link to={`/movies/${hero.id}`} className="btn btn-primary">
                View Details
              </Link>
              <Link to="/discover" className="btn btn-ghost">
                Browse All
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trending Grid */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Trending Now</h2>
          <Link to="/discover" className="section-link">See all →</Link>
        </div>
        <div className="movies-grid">
          {trending.slice(0, 18).map(m => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
