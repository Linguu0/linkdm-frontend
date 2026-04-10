import { Link } from 'react-router-dom';

const LogoIcon = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bolt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B6FFF" />
        <stop offset="100%" stopColor="#6C47FF" />
      </linearGradient>
    </defs>
    <rect width="28" height="28" rx="7" fill="url(#bolt-grad)" fillOpacity="0.15" />
    <path
      d="M15.5 5L9 15.5h4.5L12.5 23l7-10.5h-4.5L15.5 5z"
      fill="url(#bolt-grad)"
      stroke="url(#bolt-grad)"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Navbar({ variant = 'landing', username, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <LogoIcon />
        Random link
      </Link>

      <div className="navbar-right">
        {variant === 'landing' && (
          <Link to="/dashboard" className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>Connect Instagram</span>
          </Link>
        )}
        {variant === 'dashboard' && (
          <div className="navbar-profile">
            <div className="navbar-avatar">
              <span className="avatar-placeholder">
                {username ? username[0].toUpperCase() : 'U'}
              </span>
            </div>
            <span className="navbar-username">@{username || 'user'}</span>
            <button className="navbar-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
