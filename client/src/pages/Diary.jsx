import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Diary.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w92';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Diary = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/diary')
      .then(({ data }) => setEntries(data))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const deleteEntry = async (id) => {
    if (!window.confirm('Remove this diary entry?')) return;
    try {
      await api.delete(`/diary/${id}`);
      setEntries(entries.filter(e => e._id !== id));
    } catch { /* ignore */ }
  };

  // Group entries by month/year
  const grouped = entries.reduce((acc, entry) => {
    const d = new Date(entry.watchedOn);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Diary</h1>
          <p className="page-subtitle">{entries.length} film{entries.length !== 1 ? 's' : ''} logged</p>
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📖</div>
            <h3>Your diary is empty</h3>
            <p>Log a watch from any movie's detail page</p>
            <Link to="/discover" className="btn btn-primary" style={{ marginTop: 20 }}>
              Find a Film
            </Link>
          </div>
        ) : (
          <div className="diary-timeline">
            {Object.entries(grouped).map(([month, monthEntries]) => (
              <div key={month} className="diary-month">
                <div className="diary-month-label">{month}</div>
                {monthEntries.map(entry => {
                  const d = new Date(entry.watchedOn);
                  return (
                    <div key={entry._id} className="diary-entry card">
                      <div className="diary-date">
                        <div className="diary-day">{d.getDate()}</div>
                        <div className="diary-dow">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}</div>
                      </div>
                      <Link to={`/movies/${entry.tmdbId}`} className="diary-poster">
                        {entry.posterPath ? (
                          <img src={`${POSTER_BASE}${entry.posterPath}`} alt={entry.movieTitle} loading="lazy" />
                        ) : (
                          <div className="diary-no-poster">🎬</div>
                        )}
                      </Link>
                      <div className="diary-info">
                        <Link to={`/movies/${entry.tmdbId}`} className="diary-title">{entry.movieTitle}</Link>
                        {entry.rating != null && entry.rating > 0 && (
                          <div className="diary-rating">{'★'.repeat(Math.round(entry.rating))}{'☆'.repeat(5 - Math.round(entry.rating))}</div>
                        )}
                        {entry.rewatch && <span className="badge" style={{ fontSize:'0.7rem' }}>↩ Rewatch</span>}
                        {entry.review && <p className="diary-review">{entry.review}</p>}
                      </div>
                      <button
                        id={`del-diary-${entry._id}`}
                        className="diary-delete btn btn-ghost"
                        onClick={() => deleteEntry(entry._id)}
                        title="Delete entry"
                      >
                        🗑
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;
