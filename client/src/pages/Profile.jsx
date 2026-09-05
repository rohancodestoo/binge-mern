import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

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

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const { data } = await api.put('/users/profile', {
        username: editUsername,
        avatar: editAvatar,
        bio: editBio,
      });
      setProfile({ ...profile, ...data });
      updateUser({ username: data.username, avatar: data.avatar });
      setShowEditModal(false);
      if (data.username !== username) {
        navigate(`/users/${data.username}`);
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = () => {
    setEditUsername(profile.username);
    setEditAvatar(profile.avatar || '');
    setEditBio(profile.bio || '');
    setShowEditModal(true);
  };

  const deleteReview = async (e, reviewId) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
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
          {isOwnProfile && (
            <button
              className="btn btn-ghost"
              onClick={openEditModal}
            >
              Edit Profile
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
                    <div className="pr-title-row">
                      <div className="pr-title">{r.movieTitle}</div>
                      {isOwnProfile && (
                        <button className="btn btn-danger btn-sm" onClick={(e) => deleteReview(e, r._id)}>
                          Delete
                        </button>
                      )}
                    </div>
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
      
      {showEditModal && (
        <div className="log-overlay" onClick={() => setShowEditModal(false)}>
          <div className="log-modal card" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleEditProfile}>
              <h3 className="log-modal-title">Edit Profile</h3>
              
              <label className="log-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
                required
              />
              
              <label className="log-label">Avatar URL (optional)</label>
              <input
                type="text"
                className="form-input"
                value={editAvatar}
                onChange={e => setEditAvatar(e.target.value)}
              />
              
              <label className="log-label">Bio (optional)</label>
              <textarea
                className="form-input"
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={3}
              />
              
              {editError && <p className="error-msg">{editError}</p>}
              
              <div className="log-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
