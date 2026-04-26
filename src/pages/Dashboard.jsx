import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import CampaignCard from '../components/CampaignCard';
import CreateCampaignDrawer from '../components/CreateCampaignDrawer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign, getAnalytics, getMediaPosts } from '../api';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [username, setUsername] = useState('');
  
  // Ready to Setup grid state
  const [mediaPosts, setMediaPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [initialTarget, setInitialTarget] = useState(null);
  const [skippedPosts, setSkippedPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('linkdm_skipped_posts') || '[]');
    } catch {
      return [];
    }
  });

  const addToast = useToast();
  const navigate = useNavigate();

  // Auth guard: redirect to landing if no token
  useEffect(() => {
    const token = localStorage.getItem('linkdm_token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // Load username from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('linkdm_username');
    if (stored) setUsername(stored);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setLoadingPosts(true);
    setLoadError(false);
    try {
      const [campaignsData, analyticsData, postsData] = await Promise.allSettled([
        getCampaigns(),
        getAnalytics(),
        getMediaPosts(),
      ]);

      // Check if ALL calls failed (backend likely down)
      const allFailed = [campaignsData, analyticsData, postsData].every(r => r.status === 'rejected');
      if (allFailed) {
        setLoadError(true);
        return;
      }

      if (campaignsData.status === 'fulfilled') {
        const data = campaignsData.value;
        setCampaigns(Array.isArray(data) ? data : data.campaigns || data.data || []);
      }
      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      }
      if (postsData.status === 'fulfilled') {
        const pData = postsData.value;
        if (pData && pData.posts) {
          setMediaPosts(pData.posts);
          setPostsError(null);
        } else if (pData && pData.error) {
          console.error('❌ Error response from posts/media:', pData.error);
          setPostsError(pData.error);
        } else {
          setMediaPosts([]);
          setPostsError(null);
        }
      } else {
        console.error('❌ Failed to fetch media posts:', postsData.reason);
        setPostsError(postsData.reason?.message || 'Failed to fetch media posts');
      }
    } catch (e) {
      console.error(e);
      setLoadError(true);
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
      setLoadingPosts(false);
    }
  }

  async function handleSave(data) {
    setSubmitting(true);
    try {
      if (editingCampaign) {
        const result = await updateCampaign(editingCampaign.id, data);
        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingCampaign.id ? { ...c, ...data, ...(result.campaign || result) } : c))
        );
        addToast('Campaign updated successfully!', 'success');
      } else {
        const result = await createCampaign(data);
        setCampaigns((prev) => [...prev, result.campaign || result]);
        addToast('Campaign created successfully!', 'success');
      }
      setDrawerOpen(false);
      setEditingCampaign(null);
    } catch (e) {
      addToast(e.message || 'Failed to save campaign', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id, isActive) {
    try {
      await updateCampaign(id, { is_active: isActive });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: isActive } : c))
      );
      addToast(isActive ? 'Campaign activated' : 'Campaign paused', 'success');
    } catch {
      addToast('Failed to toggle campaign status', 'error');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setConfirmDelete(null);
      addToast('Campaign deleted', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to delete campaign', 'error');
    }
  }

  function handleLogout() {
    localStorage.removeItem('linkdm_token');
    localStorage.removeItem('linkdm_username');
    navigate('/');
  }

  function handleSkipPost(postId) {
    const nextSkipped = [...skippedPosts, postId];
    setSkippedPosts(nextSkipped);
    localStorage.setItem('linkdm_skipped_posts', JSON.stringify(nextSkipped));
  }

  function handleOpenDrawer(targetPost = null) {
    setEditingCampaign(null);
    setInitialTarget(targetPost);
    setDrawerOpen(true);
  }

  function handleEdit(campaign) {
    setEditingCampaign(campaign);
    setInitialTarget(null);
    setDrawerOpen(true);
  }

  const activeCampaigns = campaigns.filter((c) => c.is_active);
  const totalKeywords = campaigns.reduce((acc, c) => {
    if (Array.isArray(c.keyword)) return acc + c.keyword.length;
    if (c.keyword) return acc + 1;
    return acc;
  }, 0);
  const dmsSent = analytics?.analytics 
    ? analytics.analytics.reduce((sum, item) => sum + (item.dm_count || 0), 0) 
    : 0;

  // Filter out skipped posts
  const availablePosts = mediaPosts.filter(
    p => !skippedPosts.includes(p.id)
  );

  const displayedPosts = showAllPosts ? availablePosts : availablePosts.slice(0, 8);

  return (
    <div className="dashboard">
      <Navbar variant="dashboard" username={username || 'user'} onLogout={handleLogout} />

      <div className="dashboard-content">
        {/* ═══ FULL-PAGE ERROR / RETRY STATE ═══ */}
        {loadError && !loading && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3>Couldn&apos;t reach the server</h3>
            <p>The backend might be starting up (free tier cold start). Try again in a few seconds.</p>
            <button className="btn-primary" onClick={loadData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
              <span>Retry</span>
            </button>
          </div>
        )}

        {!loadError && (
          <div className="header-row">
            <h1>Dashboard <span style={{fontSize: '12px', opacity: 0.5, verticalAlign: 'middle', marginLeft: '10px'}}>v2.1.0</span></h1>
            <button className="btn-primary" onClick={() => setDrawerOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span>Create Campaign</span>
            </button>
          </div>
        )}

        {!loadError && (
          <div className="stats-row">
          <StatsCard
            label="Total Campaigns"
            value={campaigns.length}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            }
          />
          <StatsCard
            label="Active Campaigns"
            value={activeCampaigns.length}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />
          <StatsCard
            label="DMs Sent"
            value={dmsSent.toLocaleString()}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            }
          />
          <StatsCard
            label="Keywords Active"
            value={totalKeywords}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
                <line x1="10" y1="3" x2="8" y2="21" />
                <line x1="16" y1="3" x2="14" y2="21" />
              </svg>
            }
          />
        </div>
        )}

        {/* ═══ READY TO SETUP GRID ═══ */}
        {(!loadingPosts && postsError) ? (
          <div className="ready-setup-section empty-ready-state">
            <p style={{ color: '#ff4d4f' }}>Error loading posts: {postsError}</p>
          </div>
        ) : (!loadingPosts && availablePosts.length > 0) ? (
          <div className="ready-setup-section">
            <div className="campaigns-header">
              <div className="ready-setup-title-box">
                <h2>Ready to Setup</h2>
                <span className="ready-badge">{availablePosts.length}</span>
              </div>
              <p className="ready-subtitle">AutoDM isn&apos;t active on these posts yet</p>
            </div>
            
            <div className="posts-grid">
              {displayedPosts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-card-top">
                    {post.thumbnail_url ? (
                      <img src={post.thumbnail_url} alt={post.caption || 'Post'} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="post-card-placeholder" />
                    )}
                    <div className="post-card-badge">
                      {post.media_type === 'VIDEO' ? '▶ Reel' : '🖼 Post'}
                    </div>
                    <div className="post-card-ig-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </div>
                  </div>
                  <div className="post-card-bottom">
                    <p className="post-card-caption">
                      {post.caption ? (
                        post.caption.length > 50 ? post.caption.substring(0, 50) + '...' : post.caption
                      ) : (
                        <span className="post-card-no-caption">💬 No caption</span>
                      )}
                    </p>
                    <div className="post-card-time">{timeAgo(post.timestamp)}</div>
                    <div className="post-card-actions">
                      <button 
                        className="btn-primary post-card-btn-setup"
                        onClick={() => handleOpenDrawer(post)}
                      >
                        🔗 Setup LinkDM
                      </button>
                      <button 
                        className="post-card-btn-skip"
                        onClick={() => handleSkipPost(post.id)}
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {availablePosts.length > 8 && !showAllPosts && (
              <div className="posts-grid-footer">
                <button className="btn-secondary" onClick={() => setShowAllPosts(true)}>
                  View All {availablePosts.length} Posts
                </button>
              </div>
            )}
          </div>
        ) : (!loadingPosts && mediaPosts.length === 0) ? (
          <div className="ready-setup-section empty-ready-state">
            <p>No posts found</p>
          </div>
        ) : (!loadingPosts && mediaPosts.length > 0) ? (
          <div className="ready-setup-section empty-ready-state">
            <p>All posts have active campaigns! 🎉</p>
          </div>
        ) : loadingPosts ? (
          <div className="ready-setup-section">
            <div className="campaigns-header">
              <h2>Ready to Setup</h2>
            </div>
            <div className="posts-grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="post-card post-card-skeleton">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-bottom">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line" style={{ width: '60%' }}></div>
                    <div className="skeleton-btn"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ═══ CAMPAIGNS ═══ */}
        <div className="campaigns-header">
          <h2>Your Campaigns</h2>
          <button className="btn-primary" onClick={() => handleOpenDrawer(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Campaign</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : campaigns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3>No campaigns yet</h3>
            <p>Create your first campaign to start automating DMs to your audience</p>
            <button className="btn-primary" onClick={() => handleOpenDrawer(null)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create Campaign</span>
            </button>
          </div>
        ) : (
          <div className="campaigns-grid">
            {campaigns.map((campaign, i) => (
              <CampaignCard
                key={campaign.id || i}
                campaign={campaign}
                onToggle={handleToggle}
                onDelete={(id, name) => setConfirmDelete({ id, name })}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══ CREATE DRAWER ═══ */}
      <CreateCampaignDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingCampaign(null);
        }}
        onSubmit={handleSave}
        isSubmitting={submitting}
        initialTarget={initialTarget}
        editingCampaign={editingCampaign}
      />

      {/* ═══ CONFIRM DELETE ═══ */}
      {confirmDelete && (
        <div className="confirm-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="confirm-dialog">
            <h3>Delete Campaign</h3>
            <p>
              Are you sure you want to delete <strong>&ldquo;{confirmDelete.name}&rdquo;</strong>?
              This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button className="confirm-delete" onClick={() => handleDelete(confirmDelete.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Time ago helper mapping MS to human readable strings
function timeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins || 1} min${diffMins !== 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
}
