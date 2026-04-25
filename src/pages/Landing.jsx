import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../styles/landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const auth = params.get('auth');
    const igUserId = params.get('ig_user_id');

    if (auth === 'success' && igUserId) {
      localStorage.setItem('linkdm_token', igUserId);
      localStorage.setItem('linkdm_username', 'Creator');
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate]);
  return (
    <div className="landing">
      <Navbar variant="landing" />

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-badge">
          <span className="sparkle">✦</span>
          Automate Your Instagram DMs
        </div>

        <h1>
          <span className="gradient-text">Turn Comments Into</span>
          <br />
          <span className="gradient-text">Conversations</span>
        </h1>

        <p className="hero-subtitle">
          Someone comments &ldquo;LINK&rdquo; on your reel.
          They instantly get your DM. Zero effort.
        </p>

        <a href="https://linkdm-backend.onrender.com/auth/instagram" className="btn-primary hero-cta">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          <span>Connect Instagram — It&apos;s Free</span>
        </a>

        <div className="hero-trust">
          <span><span className="check">✓</span> No credit card</span>
          <span><span className="check">✓</span> Setup in 2 mins</span>
          <span><span className="check">✓</span> Free forever</span>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            How It Works
          </div>
          <h2 className="section-title">Three simple steps</h2>
          <p className="section-subtitle">
            Set it up once and let Random link handle the rest. Your audience gets instant replies while you sleep.
          </p>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card animate-fade-in-up-delay-1">
              <div className="step-number">1</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <h3>Post a Reel</h3>
              <p>Share content with your audience as you normally do</p>
            </div>

            {/* Step 2 */}
            <div className="step-card animate-fade-in-up-delay-2">
              <div className="step-number">2</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>They Comment</h3>
              <p>Someone types your trigger keyword in the comments</p>
            </div>

            {/* Step 3 */}
            <div className="step-card animate-fade-in-up-delay-3">
              <div className="step-number">3</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3>Auto DM Sent</h3>
              <p>We instantly send your personalized message via DM</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-bar animate-fade-in-up-delay-4">
            <div className="stat-item">
              <div className="stat-number">636K+</div>
              <div className="stat-label">Views Automated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">74K+</div>
              <div className="stat-label">Creators Trust Us</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">&lt; 30s</div>
              <div className="stat-label">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <p>© 2026 Random link. Automate your Instagram with confidence.</p>
      </footer>
    </div>
  );
}
