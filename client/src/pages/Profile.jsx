import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

const Profile = () => {
  const { username } = useParams();
  const { user }     = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const [{ data: p }, { data: r }] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/reviews`),
      ]);
      setProfile(p);
      setReviews(r);
      if (user) {
        setFollowing(p.followers?.some(f => f._id === user._id));
      }
      setLoading(false);
    };
    fetchProfile().catch(() => setLoading(false));
  }, [username, user]);

  const handleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      if (following) {
        await api.delete(`/users/${username}/follow`);
        setFollowing(false);
        setProfile(prev => ({
          ...prev,
          followers: prev.followers.filter(f => f._id !== user._id),
        }));
      } else {
        await api.post(`/users/${username}/follow`);
        setFollowing(true);
        setProfile(prev => ({
          ...prev,
          followers: [...(prev.followers || []), { _id: user._id, username: user.username }],
        }));
      }
    } finally { setFollowLoading(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!profile) return <div className="page container"><p>User not found.</p></div>;

  const isOwnProfile = user?.username === username;

  return (
    <div className="page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header card">
          <div className="profile-avatar-lg">{profile.username[0].toUpperCase()}</div>
          <div className="profile-info">
            <h1 className="profile-username">{profile.username}</h1>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{profile.reviewCount || 0}</span>
                <span className="stat-label">Films</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value">{profile.followers?.length || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value">{profile.following?.length || 0}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
          {!isOwnProfile && user && (
            <button
              id="follow-btn"
              className={`btn ${following ? 'btn-ghost' : 'btn-primary'}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {followLoading ? '…' : following ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        {/* Reviews */}
        <div className="profile-section">
          <h2 className="section-heading">{profile.username}'s Reviews ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No reviews yet</h3>
            </div>
          ) : (
            <div className="profile-reviews">
              {reviews.map(r => (
                <Link key={r._id} to={`/movies/${r.tmdbId}`} className="profile-review-card card">
                  <div className="pr-poster">
                    {r.posterPath ? (
                      <img src={`${POSTER_BASE}${r.posterPath}`} alt={r.movieTitle} loading="lazy" />
                    ) : (
                      <div className="pr-no-poster">🎬</div>
                    )}
                  </div>
                  <div className="pr-body">
                    <div className="pr-title">{r.movieTitle}</div>
                    <div className="pr-rating">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                    {r.content && <p className="pr-content">{r.content.slice(0, 120)}{r.content.length > 120 ? '…' : ''}</p>}
                    <div className="pr-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
