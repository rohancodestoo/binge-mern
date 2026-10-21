import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Discover.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

const Discover = () => {
  const [movies, setMovies]   = useState([]);
  const [query, setQuery]     = useState('');
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [mode, setMode]       = useState('popular'); // 'popular' | 'search'

  const fetchPopular = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/movies/popular?page=${p}`);
      setMovies(data.results || []);
      setTotalPages(Math.min(data.total_pages, 500));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movies. Please try again.');
    } finally { setLoading(false); }
  }, []);

  const fetchSearch = useCallback(async (q, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/movies/search?q=${encodeURIComponent(q)}&page=${p}`);
      setMovies(data.results || []);
      setTotalPages(Math.min(data.total_pages, 500));
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchPopular(1);
  }, [fetchPopular]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) { setMode('popular'); setPage(1); fetchPopular(1); return; }
    setMode('search');
    setPage(1);
    fetchSearch(query, 1);
  };

  const changePage = (newPage) => {
    setPage(newPage);
    if (mode === 'search') fetchSearch(query, newPage);
    else fetchPopular(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Discover Films</h1>
          <p className="page-subtitle">Search millions of movies and find your next watch</p>
        </div>

        {/* Search Bar */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Search for a movie…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary search-btn">
            Search
          </button>
          {mode === 'search' && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setQuery(''); setMode('popular'); setPage(1); fetchPopular(1); }}
            >
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <div className="spinner" />
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => mode === 'search' ? fetchSearch(query, page) : fetchPopular(page)}>Retry</button>
          </div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          <>
            <div className="movies-grid-wide">
              {movies.map(m => (
                <Link key={m.id} to={`/movies/${m.id}`} className="movie-poster-card">
                  {m.poster_path ? (
                    <img src={`${POSTER_BASE}${m.poster_path}`} alt={m.title} loading="lazy" />
                  ) : (
                    <div className="no-poster-disc">🎬<span>{m.title}</span></div>
                  )}
                  <div className="overlay">
                    <div>
                      <div className="overlay-title">{m.title}</div>
                      {m.release_date && (
                        <div className="overlay-year">{m.release_date.slice(0,4)}</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                  className="btn btn-ghost"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;
