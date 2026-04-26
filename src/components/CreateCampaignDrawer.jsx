import { useState, useRef, useEffect } from 'react';

import FlowCanvas from './FlowBuilder/FlowCanvas';

const TRIGGER_TYPES = [
  { value: 'reel_comment', label: 'Reel Comment' },
  { value: 'post_comment', label: 'Post Comment' },
  { value: 'story_reply', label: 'Story Reply' },
  { value: 'dm_keywords', label: 'DM Keywords' },
];

const DM_TYPES = [
  { value: 'text_message', label: 'Text Message' },
  { value: 'button_template', label: 'Button Template' },
  { value: 'quick_replies', label: 'Quick Replies' },
  { value: 'flow_builder', label: 'Flow Builder ✨' },
];

export default function CreateCampaignDrawer({ isOpen, onClose, onSubmit, isSubmitting, initialTarget }) {
  const [activeTab, setActiveTab] = useState(0); // 0: DM Setup, 1: Trigger Setup, 2: Settings
  const [closing, setClosing] = useState(false);

  // Tab 1: DM Setup
  const [name, setName] = useState('');
  const [dmType, setDmType] = useState('flow_builder');
  const [message, setMessage] = useState(''); // Used by text & quick replies
  
  // -- Button Template State --
  const [slides, setSlides] = useState([{ id: 1, image: '', title: '', destination: 'url', url: '', btnLabel: '' }]);
  const [activeSlide, setActiveSlide] = useState(0);

  // -- Quick Replies State --
  const [quickReplies, setQuickReplies] = useState([{ text: '' }]);

  // -- Flow Builder State --
  const [flowData, setFlowData] = useState(null);

  // Tab 2: Trigger Setup
  const [triggerType, setTriggerType] = useState('reel_comment');
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const keywordRef = useRef(null);

  const [useExclude, setUseExclude] = useState(false);
  const [excludeKeywords, setExcludeKeywords] = useState([]);
  const [excludeInput, setExcludeInput] = useState('');
  const excludeRef = useRef(null);

  const [sendOnce, setSendOnce] = useState(true);
  const [excludeMentions, setExcludeMentions] = useState(false);

  // Tab 3: Settings (Target)
  const [targetType, setTargetType] = useState('all_posts');
  const [postUrl, setPostUrl] = useState('');
  const [postPreview, setPostPreview] = useState(null);
  const [autoCommentReply, setAutoCommentReply] = useState(true);

  const MAX_MSG_LENGTH = 1000;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialTarget) {
          setTargetType('specific_post');
          setPostUrl(initialTarget.id || '');
          setPostPreview(initialTarget);
        } else {
          setTargetType('all_posts');
          setPostUrl('');
          setPostPreview(null);
        }
        setActiveTab(0);
      }, 0);
    }
  }, [isOpen, initialTarget]);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
      resetForm();
    }, 250);
  }

  function resetForm() {
    setName('');
    setActiveTab(0);
    setDmType('text_message');
    setMessage('');
    setSlides([{ id: 1, image: '', title: '', destination: 'url', url: '', btnLabel: '' }]);
    setActiveSlide(0);
    setQuickReplies([{ text: '' }]);
    setFlowData(null);
    setTriggerType('reel_comment');
    setKeywords([]);
    setKeywordInput('');
    setUseExclude(false);
    setExcludeKeywords([]);
    setExcludeInput('');
    setSendOnce(true);
    setExcludeMentions(false);
    setTargetType('all_posts');
    setPostUrl('');
    setPostPreview(null);
    setAutoCommentReply(true);
  }

  // ------- Keyword Handlers -------
  function createKeywordHandler(list, setList, inputVal, setInputVal) {
    return {
      onChange: (e) => {
        const val = e.target.value;
        if (val.includes(',')) {
          const parts = val.split(',');
          parts.forEach((part) => {
            const trimmed = part.trim().toUpperCase();
            if (trimmed && !list.includes(trimmed)) {
              setList((prev) => [...prev, trimmed]);
            }
          });
          setInputVal('');
        } else {
          setInputVal(val);
        }
      },
      onKeyDown: (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const trimmed = inputVal.trim().toUpperCase();
          if (trimmed && !list.includes(trimmed)) {
            setList((prev) => [...prev, trimmed]);
          }
          setInputVal('');
        }
        if (e.key === 'Backspace' && inputVal === '' && list.length > 0) {
          setList((prev) => prev.slice(0, -1));
        }
      },
      remove: (kw) => setList((prev) => prev.filter((k) => k !== kw))
    };
  }

  const keywordHandlers = createKeywordHandler(keywords, setKeywords, keywordInput, setKeywordInput);
  const excludeHandlers = createKeywordHandler(excludeKeywords, setExcludeKeywords, excludeInput, setExcludeInput);

  // ------- Slides Handlers -------
  function handleAddSlide() {
    if (slides.length < 10) {
      setSlides([...slides, { id: slides.length + 1, image: '', title: '', destination: 'url', url: '', btnLabel: '' }]);
      setActiveSlide(slides.length);
    }
  }

  function handleUpdateSlide(index, field, value) {
    const newSlides = [...slides];
    newSlides[index][field] = value;
    setSlides(newSlides);
  }

  function handleImageUpload(index, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleUpdateSlide(index, 'image', e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e, index) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageUpload(index, file);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  // ------- Quick Replies Handlers -------
  function handleAddQuickReply() {
    if (quickReplies.length < 3) {
      setQuickReplies([...quickReplies, { text: '' }]);
    }
  }

  function handleUpdateQuickReply(index, val) {
    const newReplies = [...quickReplies];
    newReplies[index].text = val;
    setQuickReplies(newReplies);
  }

  function extractMediaId(url) {
    if (!url) return null;
    if (/^\d+$/.test(url.trim())) return url.trim();
    const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  }

  // ------- Submit -------
  function handleSave() {
    // Validation
    if (!name.trim()) { setActiveTab(0); return; }
    if (keywords.length === 0) { setActiveTab(1); return; }
    if (dmType === 'text_message' && !message.trim()) { setActiveTab(0); return; }

    onSubmit({
      name: name.trim(),
      keyword: keywords,
      trigger_keyword: keywords[0] || 'LINK',
      dm_message: message.trim() || 'DM Sent via LinkDM', 
      dm_type: dmType,
      button_template_data: dmType === 'button_template' ? slides : null,
      quick_replies_data: dmType === 'quick_replies' ? quickReplies : null,
      flow_data: dmType === 'flow_builder' ? flowData : null,
      exclude_keywords: useExclude ? excludeKeywords : null,
      send_once_per_user: sendOnce,
      exclude_mentions: excludeMentions,
      auto_comment_reply: autoCommentReply,
      target_type: targetType,
      target_media_id: postPreview ? postPreview.id : extractMediaId(postUrl),
      target_thumbnail: postPreview ? postPreview.thumbnail_url : null
    });
  }

  if (!isOpen) return null;

  return (
    <>
      <div className={`drawer-overlay ${closing ? 'closing' : ''}`} onClick={(e) => { if(e.target === e.currentTarget) handleClose(); }} />
      <div className={`drawer ${closing ? 'closing' : ''}`}>
        
        <div className="drawer-header">
          <h2>New Campaign</h2>
          <button className="drawer-close" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="drawer-tabs">
          {['DM Setup', 'Trigger Setup', 'Review'].map((lbl, idx) => (
            <div 
              key={idx} 
              className={`drawer-tab ${activeTab === idx ? 'active' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              {lbl}
            </div>
          ))}
        </div>

        <div className="drawer-main">
          {/* LEFT: Forms */}
          <div className="drawer-content-col">
            {activeTab === 0 && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="cam-name">Campaign Name</label>
                  <input id="cam-name" type="text" className="form-input" placeholder="e.g. Free PDF Campaign" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                </div>

                <div className="form-group">
                  <label className="form-label">DM Type</label>
                  <div className="segmented-control">
                    {DM_TYPES.map((t) => (
                      <button key={t.value} type="button" className={`segmented-btn ${dmType === t.value ? 'active' : ''}`} onClick={() => setDmType(t.value)}>{t.label}</button>
                    ))}
                  </div>
                </div>

                {dmType === 'text_message' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="dm-msg">Message</label>
                    <textarea id="dm-msg" className="form-textarea" placeholder="Hey! Here's the link you asked for..." rows={4} value={message} onChange={(e) => setMessage(e.target.value.slice(0, MAX_MSG_LENGTH))} />
                    <div className="char-counter-row">
                      <span className="form-helper">Instagram recommends under 800 chars</span>
                      <span className={`char-counter ${message.length > 950 ? 'danger' : message.length > 800 ? 'orange' : ''}`}>{message.length} / {MAX_MSG_LENGTH}</span>
                    </div>
                  </div>
                )}

                {dmType === 'button_template' && (
                  <div className="slider-builder">
                    <div className="slider-pills">
                      {slides.map((s, idx) => (
                        <div key={idx} className={`slide-pill ${activeSlide === idx ? 'active' : ''}`} onClick={() => setActiveSlide(idx)}>
                          Slide {idx + 1}
                        </div>
                      ))}
                      {slides.length < 10 && (
                        <button type="button" className="slide-pill-add" onClick={handleAddSlide} title="Add Slide">+</button>
                      )}
                    </div>

                    {slides[activeSlide] && (
                      <div className="slide-editor animation-fade-in">
                        <label 
                          className="slide-dropzone" 
                          onDrop={(e) => handleDrop(e, activeSlide)}
                          onDragOver={handleDragOver}
                          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleImageUpload(activeSlide, e.target.files[0])} 
                          />
                          {slides[activeSlide].image ? (
                            <img src={slides[activeSlide].image} alt="Slide Preview" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain', marginBottom: '8px', borderRadius: '4px' }} />
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                          )}
                          <p>{slides[activeSlide].image ? 'Change Image' : 'Drop Image Here or Click to Upload'}</p>
                          <span className="form-helper">1.91:1 ratio recommended</span>
                        </label>
                        <div className="form-group">
                          <label className="form-label">Title (Optional)</label>
                          <input type="text" className="form-input" placeholder="Enter slide title" value={slides[activeSlide].title} onChange={(e) => handleUpdateSlide(activeSlide, 'title', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Button Action</label>
                          <div className="segmented-control" style={{marginBottom: 12}}>
                            {['url', 'phone', 'email'].map(type => (
                              <button key={type} type="button" className={`segmented-btn ${slides[activeSlide].destination === type ? 'active' : ''}`} onClick={() => handleUpdateSlide(activeSlide, 'destination', type)} style={{textTransform:'capitalize'}}>{type}</button>
                            ))}
                          </div>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder={slides[activeSlide].destination === 'url' ? 'https://...' : ''} 
                            value={slides[activeSlide].url} 
                            onChange={(e) => handleUpdateSlide(activeSlide, 'url', e.target.value)} 
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Button Label</label>
                          <input type="text" className="form-input" placeholder="e.g. Get Started" value={slides[activeSlide].btnLabel} onChange={(e) => handleUpdateSlide(activeSlide, 'btnLabel', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {dmType === 'quick_replies' && (
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" placeholder="Ask a question..." rows={3} value={message} onChange={(e) => setMessage(e.target.value)} style={{marginBottom: 16}} />
                    
                    <label className="form-label">Quick Reply Buttons (Max 3)</label>
                    <div style={{display:'flex', flexDirection:'column', gap: 12}}>
                      {quickReplies.map((qr, idx) => (
                        <input key={idx} type="text" className="form-input" placeholder="e.g. Yes please!" value={qr.text} onChange={(e) => handleUpdateQuickReply(idx, e.target.value)} />
                      ))}
                      {quickReplies.length < 3 && (
                        <button type="button" className="btn-builder-add" onClick={handleAddQuickReply}>+ Add Reply</button>
                      )}
                    </div>
                  </div>
                )}

                {dmType === 'flow_builder' && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Flow Builder</label>
                    <p className="form-helper" style={{marginBottom: '12px'}}>Your conversation flow runs in a vertical sequence. Add steps to send messages or add delays.</p>
                    <FlowCanvas 
                      keyword={keywords[0] || 'LINK'}
                      onChange={(data) => setFlowData(data)}
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Trigger Keyword</label>
                  <div className="segmented-control">
                    {TRIGGER_TYPES.map((t) => (
                      <button key={t.value} type="button" className={`segmented-btn ${triggerType === t.value ? 'active' : ''}`} onClick={() => setTriggerType(t.value)}>{t.label}</button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Keywords</label>
                  <div className="keyword-input-wrapper" onClick={() => keywordRef.current?.focus()}>
                    {keywords.map((kw) => (
                      <span key={kw} className="keyword-pill">{kw} <button type="button" className="keyword-pill-remove" onClick={(e) => { e.stopPropagation(); keywordHandlers.remove(kw); }}>×</button></span>
                    ))}
                    <input ref={keywordRef} type="text" className="keyword-raw-input" placeholder={keywords.length===0 ? "LINK, PDF, FREE" : ""} value={keywordInput} onChange={keywordHandlers.onChange} onKeyDown={keywordHandlers.onKeyDown} />
                  </div>
                  <span className="form-helper">Press ENTER or comma to save keyword</span>
                </div>

                <div className="form-group" style={{marginTop: 16}}>
                  <label className="form-label" style={{marginBottom: 16}}>Settings:</label>
                  
                  <div className="setting-checkbox-row">
                    <input type="checkbox" id="cb-exclude" checked={useExclude} onChange={(e) => setUseExclude(e.target.checked)} />
                    <div className="setting-cb-info">
                      <label htmlFor="cb-exclude" className="setting-cb-label">Exclude Keywords</label>
                      <span className="setting-cb-desc">Don&apos;t send if comment contains these words</span>
                      {useExclude && (
                        <div className="keyword-input-wrapper" onClick={() => excludeRef.current?.focus()} style={{marginTop: 8}}>
                          {excludeKeywords.map((kw) => (
                            <span key={kw} className="keyword-pill">{kw} <button type="button" className="keyword-pill-remove" onClick={(e) => { e.stopPropagation(); excludeHandlers.remove(kw); }}>×</button></span>
                          ))}
                          <input ref={excludeRef} type="text" className="keyword-raw-input" placeholder="HATE, SCAM" value={excludeInput} onChange={excludeHandlers.onChange} onKeyDown={excludeHandlers.onKeyDown} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="setting-checkbox-row">
                    <input type="checkbox" id="cb-once" checked={sendOnce} onChange={(e) => setSendOnce(e.target.checked)} />
                    <div className="setting-cb-info">
                      <label htmlFor="cb-once" className="setting-cb-label">Send once per user/post</label>
                      <span className="setting-cb-desc">Each person only receives 1 DM per post</span>
                    </div>
                  </div>

                  <div className="setting-checkbox-row">
                    <input type="checkbox" id="cb-mention" checked={excludeMentions} onChange={(e) => setExcludeMentions(e.target.checked)} />
                    <div className="setting-cb-info">
                      <label htmlFor="cb-mention" className="setting-cb-label">Exclude @Mentions</label>
                      <span className="setting-cb-desc">Skip comments that are @mentions of others</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label">Campaign Summary</label>
                  <div className="campaign-summary-box" style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: 20,
                    marginTop: 8
                  }}>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Campaign Name</span>
                      <p style={{ color: '#fff', marginTop: 4, fontWeight: 500 }}>{name || '—'}</p>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>DM Type</span>
                      <p style={{ color: '#fff', marginTop: 4, fontWeight: 500 }}>{dmType === 'text_message' ? '💬 Text Message' : dmType === 'button_template' ? '🔘 Button Template' : dmType === 'flow_builder' ? '✨ Flow Builder' : '⚡ Quick Replies'}</p>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Keywords</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                        {keywords.length > 0 ? keywords.map(kw => (
                          <span key={kw} style={{
                            background: 'rgba(124,58,237,0.2)',
                            border: '1px solid rgba(124,58,237,0.3)',
                            color: '#a78bfa',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 500
                          }}>{kw}</span>
                        )) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>No keywords set</span>}
                      </div>
                    </div>
                    {message && (
                      <div>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Message Preview</span>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4, fontSize: 13, lineHeight: 1.5 }}>{message.length > 100 ? message.substring(0, 100) + '...' : message}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="auto-reply-row" style={{marginTop: 16}}>
                  <div className="auto-reply-info">
                    <span className="auto-reply-label">Also reply to comment publicly</span>
                    <span className="form-helper">We&apos;ll comment &ldquo;Check your DMs! 📩&rdquo; on their comment</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={autoCommentReply} onChange={() => setAutoCommentReply(!autoCommentReply)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  background: 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <span style={{ fontSize: 18 }}>✨</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    This campaign will monitor <strong style={{ color: '#a78bfa' }}>all posts</strong> for matching keywords and auto-send DMs.
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* RIGHT: iPhone Preview */}
          <div className="drawer-preview-col">
            <div className="iphone-frame">
              <div className="iphone-notch"></div>
              <div className="iphone-header">
                <div className="iphone-avatar">L</div>
                <div className="iphone-title">LinkDM Bot</div>
              </div>
              <div className="iphone-body">
                <div className="iphone-bubble iphone-incoming">
                  {keywords.length > 0 ? keywords[0] : 'LINK'}
                </div>
                
                {dmType === 'text_message' && (
                  <div className="iphone-bubble iphone-outgoing">
                    {message || 'Start typing a message...'}
                  </div>
                )}

                {dmType === 'flow_builder' && (
                  <div className="iphone-bubble iphone-outgoing">
                    {flowData?.steps?.find(s => s.type === 'message')?.text || 'Flow Message Preview...'}
                  </div>
                )}

                {dmType === 'button_template' && (
                  <div className="iphone-template-card">
                    <div className="iphone-template-img">
                      {slides[0]?.image ? <img src={slides[0].image} alt="Preview" /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>}
                    </div>
                    <div className="iphone-template-title-container">
                      {slides[0]?.title && <div className="iphone-template-text">{slides[0].title}</div>}
                      <div className="iphone-template-subtitle">Sent by Randombaaz</div>
                    </div>
                    <div className="iphone-template-btn">{slides[0]?.btnLabel || 'Button Text'}</div>
                  </div>
                )}

                {dmType === 'quick_replies' && (
                  <>
                    <div className="iphone-bubble iphone-outgoing">
                      {message || 'Ask a question...'}
                    </div>
                    <div className="iphone-quick-replies">
                      {quickReplies.filter(qr => qr.text.trim()).length > 0 ? quickReplies.map((qr, idx) => qr.text.trim() && (
                        <div key={idx} className="iphone-quick-btn">{qr.text}</div>
                      )) : (
                        <div className="iphone-quick-btn">Yes Please!</div>
                      )}
                    </div>
                  </>
                )}

              </div>
              <div className="iphone-footer">
                <div className="iphone-input-bar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                  <div className="iphone-input-placeholder">Message...</div>
                </div>
                <div className="iphone-watermark">Sent with LinkDM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          {activeTab > 0 && (
            <button type="button" className="btn-secondary" style={{padding: '12px 24px', borderRadius: 8}} onClick={() => setActiveTab(activeTab - 1)}>
              ← Back
            </button>
          )}
          {activeTab < 2 ? (
            <button type="button" className="btn-primary" style={{padding: '12px 24px', borderRadius: 8}} onClick={() => setActiveTab(activeTab + 1)}>
              Next →
            </button>
          ) : (
            <button type="button" className="btn-primary drawer-submit" disabled={isSubmitting || !name.trim()} onClick={handleSave} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? (
                <><span className="spinner spinner-sm spinner-inline" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}></span> <span>Saving...</span></>
              ) : <span>Save Campaign</span>}
            </button>
          )}
        </div>

      </div>
    </>
  );
}
