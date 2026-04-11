import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import './PersonDetails.css';

const PROFILE_BASE = 'https://image.tmdb.org/t/p/w500';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

const PersonDetails = () => {
  const { tmdbId } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerson = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/person/${tmdbId}`);
        setPerson(data);
      } catch (err) {
        console.error('Failed to fetch person details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
  }, [tmdbId]);

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!person) return <div className="page container"><p>Person not found.</p></div>;

  // Filter movies with valid posters and sort by popularity or release date
  const movies = person.movie_credits?.cast
    ?.filter(m => m.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20) || [];

  return (
    <div className="person-detail-page page container">
      <div className="person-info-layout">
        
        {/* Left Sidebar: Profile picture and personal info */}
        <aside className="person-sidebar">
          <div className="person-profile-pic">
            {person.profile_path ? (
              <img src={`${PROFILE_BASE}${person.profile_path}`} alt={person.name} />
            ) : (
              <div className="profile-placeholder">👤</div>
            )}
          </div>
          
          <div className="person-facts">
            <h3 className="section-heading-small">Personal Info</h3>
            
            <div className="fact-item">
              <strong>Known For</strong>
              <span>{person.known_for_department}</span>
            </div>
            {person.birthday && (
              <div className="fact-item">
                <strong>Born</strong>
                <span>{new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
            {person.place_of_birth && (
              <div className="fact-item">
                <strong>Place of Birth</strong>
                <span>{person.place_of_birth}</span>
              </div>
            )}
            {person.deathday && (
              <div className="fact-item">
                <strong>Died</strong>
                <span>{new Date(person.deathday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content: Bio and Movies */}
        <main className="person-main-content">
          <h1 className="person-title">{person.name}</h1>
          
          <div className="person-bio-section">
            <h2 className="section-heading">Biography</h2>
            <div className="person-bio">
              {person.biography ? (
                // Split bio by newlines and render paragraphs
                person.biography.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <p className="no-bio">We don't have a biography for {person.name}.</p>
              )}
            </div>
          </div>

          <div className="person-movies-section">
            <h2 className="section-heading">Known For</h2>
            {movies.length > 0 ? (
              <div className="movies-grid-wide">
                {movies.map(m => (
                  <Link key={m.id} to={`/movies/${m.id}`} className="movie-poster-card">
                    <img src={`${POSTER_BASE}${m.poster_path}`} alt={m.title} loading="lazy" />
                    <div className="overlay">
                      <div>
                        <div className="overlay-title">{m.title}</div>
                        {m.release_date && (
                          <div className="overlay-year">{m.release_date.slice(0, 4)}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p>No known movies found.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PersonDetails;
