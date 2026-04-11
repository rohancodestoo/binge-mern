import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">Binge</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/discover" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Discover
          </NavLink>
          {user && (
            <>
              <NavLink to="/diary" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Diary
              </NavLink>
              <NavLink to="/watchlist" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Watchlist
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <button className="user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="user-avatar">{user.username[0].toUpperCase()}</div>
                <span className="user-name">{user.username}</span>
                <span className="chevron">{menuOpen ? '▲' : '▼'}</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <Link to={`/users/${user.username}`} onClick={() => setMenuOpen(false)} className="dropdown-item">
                    👤 Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item danger">
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Join Free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
