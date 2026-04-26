const AVATAR_COLORS = [
  'linear-gradient(135deg, #6C47FF, #8B6FFF)',
  'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
  'linear-gradient(135deg, #4ECDC4, #44B09E)',
  'linear-gradient(135deg, #F093FB, #F5576C)',
  'linear-gradient(135deg, #4FACFE, #00F2FE)',
  'linear-gradient(135deg, #43E97B, #38F9D7)',
  'linear-gradient(135deg, #FA709A, #FEE140)',
  'linear-gradient(135deg, #A18CD1, #FBC2EB)',
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function CampaignCard({ campaign, onToggle, onDelete, onEdit }) {
  const firstLetter = campaign.name ? campaign.name[0].toUpperCase() : 'C';
  const dmPreview = campaign.dm_message
    ? campaign.dm_message.substring(0, 50) + (campaign.dm_message.length > 50 ? '…' : '')
    : 'No message set';

  // Handle keyword as array (new) or string (legacy)
  const rawKeyword = campaign.keyword || campaign.trigger_keyword || 'LINK';
  const keywordList = Array.isArray(rawKeyword)
    ? rawKeyword
    : rawKeyword.includes(',')
      ? rawKeyword.split(',').map((k) => k.trim().toUpperCase())
      : [rawKeyword.toUpperCase()];

  return (
    <div className="campaign-card">
      <div
        className="campaign-avatar"
        style={{ background: campaign.target_thumbnail ? `url(${campaign.target_thumbnail}) center/cover no-repeat` : getColor(campaign.name || 'C') }}
      >
        {!campaign.target_thumbnail && firstLetter}
      </div>

      <div className="campaign-info">
        <div className="campaign-name">{campaign.name || 'Untitled Campaign'}</div>
        <div className="campaign-meta">
          {keywordList.map((kw, i) => (
            <span key={i} className="campaign-keyword">{kw}</span>
          ))}
          <span className="campaign-message">{dmPreview}</span>
        </div>
        {(campaign.dms_sent !== undefined || campaign.trigger_type) && (
          <div className="campaign-dms">
            {campaign.trigger_type && (
              <span>{campaign.trigger_type.replace('_', ' ')} · </span>
            )}
            {campaign.dms_sent !== undefined && <span>{campaign.dms_sent || 0} DMs sent</span>}
            {campaign.auto_comment_reply && <span> · Auto-reply on</span>}
          </div>
        )}
        <div className="campaign-target">
          {campaign.target_type === 'specific_post' ? (
            <span className="campaign-target-specific">🎯 1 specific reel</span>
          ) : (
            <span className="campaign-target-all">📌 All posts</span>
          )}
        </div>
      </div>

      <div className="campaign-actions">
        <label className="toggle-switch" title={campaign.is_active ? 'Active' : 'Inactive'}>
          <input
            type="checkbox"
            checked={campaign.is_active || false}
            onChange={() => onToggle(campaign.id, !campaign.is_active)}
          />
          <span className="toggle-slider"></span>
        </label>

        <button
          className="campaign-edit-btn"
          onClick={() => onEdit(campaign)}
          title="Edit campaign"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <button
          className="campaign-delete-btn"
          onClick={() => onDelete(campaign.id, campaign.name)}
          title="Delete campaign"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
}
