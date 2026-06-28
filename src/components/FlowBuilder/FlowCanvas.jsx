import { useState, useCallback, useEffect, useRef } from 'react';
import '../../styles/flow-builder.css';

const STEP_TYPES = [
  { type: 'message', label: 'Send Message', icon: '💬', color: '#a78bfa' },
  { type: 'button_template', label: 'Button Template', icon: '🖼️', color: '#60a5fa' },
  { type: 'delay', label: 'Add Delay', icon: '⏱️', color: '#fbbf24' },
  { type: 'condition', label: 'Add Condition', icon: '🔀', color: '#34d399' },
];

let stepIdCounter = 1;
function newId() {
  return `step-${Date.now()}-${stepIdCounter++}`;
}

function TriggerCard({ keyword }) {
  return (
    <div className="fb-card fb-trigger-card">
      <div className="fb-card-icon" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>⚡</div>
      <div className="fb-card-content">
        <div className="fb-card-label">TRIGGER</div>
        <div className="fb-card-title">When someone comments</div>
        <div className="fb-card-keyword">{keyword || 'LINK'}</div>
      </div>
    </div>
  );
}

function MessageStep({ step, onUpdate, onDelete }) {
  return (
    <div className="fb-card fb-message-card">
      <div className="fb-card-header">
        <div className="fb-card-icon" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>💬</div>
        <span className="fb-card-type">Send Message</span>
        <button className="fb-delete-btn" onClick={onDelete} title="Delete step">✕</button>
      </div>
      <textarea
        className="fb-message-input"
        placeholder="Type your message here..."
        value={step.text || ''}
        onChange={(e) => onUpdate({ ...step, text: e.target.value })}
        rows={3}
      />
      <div className="fb-char-count">{(step.text || '').length} / 1000</div>
    </div>
  );
}

function ButtonTemplateStep({ step, onUpdate, onDelete }) {
  const slides = step.slides || [{ id: 1, image: '', title: '', subtitle: '', destination: 'url', url: '', btnLabel: '' }];
  const activeSlide = step.activeSlide || 0;

  function handleUpdateSlide(index, field, value) {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    onUpdate({ ...step, slides: newSlides });
  }

  function handleAddSlide() {
    if (slides.length >= 10) return;
    const newSlides = [...slides, { id: slides.length + 1, image: '', title: '', subtitle: '', destination: 'url', url: '', btnLabel: '' }];
    onUpdate({ ...step, slides: newSlides, activeSlide: newSlides.length - 1 });
  }

  function handleRemoveSlide(index) {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    const newActive = activeSlide >= newSlides.length ? newSlides.length - 1 : activeSlide;
    onUpdate({ ...step, slides: newSlides, activeSlide: newActive });
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

  return (
    <div className="fb-card fb-button-message-card" style={{ maxWidth: '400px' }}>
      <div className="fb-card-header">
        <div className="fb-card-icon" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>🖼️</div>
        <span className="fb-card-type">Button Template</span>
        <button className="fb-delete-btn" onClick={onDelete} title="Delete step">✕</button>
      </div>
      
      <div className="slider-builder" style={{ marginTop: '12px' }}>
        <div className="slider-pills">
          {slides.map((s, idx) => (
            <div key={idx} className={`slide-pill ${activeSlide === idx ? 'active' : ''}`} onClick={() => onUpdate({ ...step, activeSlide: idx })}>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', marginBottom: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              )}
              <p style={{ margin: 0, fontSize: '12px' }}>{slides[activeSlide].image ? 'Change Image' : 'Drop Image Here or Click to Upload'}</p>
            </label>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Title</label>
              <input type="text" className="form-input" placeholder="Title" maxLength={80} value={slides[activeSlide].title} onChange={(e) => handleUpdateSlide(activeSlide, 'title', e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Subtitle (Optional)</label>
              <input type="text" className="form-input" placeholder="Subtitle" maxLength={80} value={slides[activeSlide].subtitle || ''} onChange={(e) => handleUpdateSlide(activeSlide, 'subtitle', e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Button Label</label>
              <input type="text" className="form-input" placeholder="e.g. Learn More" maxLength={20} value={slides[activeSlide].btnLabel} onChange={(e) => handleUpdateSlide(activeSlide, 'btnLabel', e.target.value)} />
            </div>
            
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Button URL</label>
              <input type="url" className="form-input" placeholder="https://" value={slides[activeSlide].url} onChange={(e) => handleUpdateSlide(activeSlide, 'url', e.target.value)} />
            </div>

            {slides.length > 1 && (
              <button type="button" className="slide-remove-btn" onClick={() => handleRemoveSlide(activeSlide)} style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', padding: 0 }}>
                Remove this slide
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DelayStep({ step, onUpdate, onDelete }) {
  return (
    <div className="fb-card fb-delay-card">
      <div className="fb-card-header">
        <div className="fb-card-icon" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>⏱️</div>
        <span className="fb-card-type">Delay</span>
        <button className="fb-delete-btn" onClick={onDelete} title="Delete step">✕</button>
      </div>
      <div className="fb-delay-controls">
        <span>Wait for</span>
        <input
          type="number"
          min="1"
          max="1440"
          value={step.duration || 1}
          onChange={(e) => onUpdate({ ...step, duration: parseInt(e.target.value) || 1 })}
          className="fb-delay-input"
        />
        <select
          value={step.unit || 'minutes'}
          onChange={(e) => onUpdate({ ...step, unit: e.target.value })}
          className="fb-delay-select"
        >
          <option value="seconds">seconds</option>
          <option value="minutes">minutes</option>
          <option value="hours">hours</option>
        </select>
      </div>
    </div>
  );
}

function ConditionStep({ step, onUpdate, onDelete }) {
  return (
    <div className="fb-card fb-condition-card">
      <div className="fb-card-header">
        <div className="fb-card-icon" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>🔀</div>
        <span className="fb-card-type">Condition</span>
        <button className="fb-delete-btn" onClick={onDelete} title="Delete step">✕</button>
      </div>
      <div className="fb-condition-controls">
        <span>If user replies with</span>
        <input
          type="text"
          placeholder="e.g. YES, SURE, OK"
          value={step.matchKeywords || ''}
          onChange={(e) => onUpdate({ ...step, matchKeywords: e.target.value })}
          className="fb-condition-input"
        />
      </div>
    </div>
  );
}

function AddStepButton({ onAdd }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="fb-add-step-wrapper">
      <div className="fb-connector-line" />
      {showMenu ? (
        <div className="fb-add-menu">
          {STEP_TYPES.map((st) => (
            <button
              key={st.type}
              className="fb-add-menu-item"
              onClick={() => { onAdd(st.type); setShowMenu(false); }}
            >
              <span className="fb-add-menu-icon">{st.icon}</span>
              <span>{st.label}</span>
            </button>
          ))}
          <button className="fb-add-menu-cancel" onClick={() => setShowMenu(false)}>Cancel</button>
        </div>
      ) : (
        <button className="fb-add-btn" onClick={() => setShowMenu(true)}>
          <span>+</span> Add Step
        </button>
      )}
    </div>
  );
}

export default function FlowCanvas({ initialData, keyword, onChange }) {
  const [steps, setSteps] = useState([]);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    
    setTimeout(() => {
      hasInitialized.current = true;
      if (initialData && initialData.steps && initialData.steps.length > 0) {
        setSteps(initialData.steps);
      } else {
        setSteps([{ id: newId(), type: 'message', text: '' }]);
      }
    }, 0);
  }, [initialData]);

  useEffect(() => {
    if (onChange) {
      const timer = setTimeout(() => {
        onChange({ steps });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [steps, onChange]);

  const addStep = useCallback((type, afterIndex) => {
    const newStep = { id: newId(), type };
    if (type === 'message') newStep.text = '';
    if (type === 'button_template') {
      newStep.slides = [{ id: 1, image: '', title: '', subtitle: '', destination: 'url', url: '', btnLabel: '' }];
      newStep.activeSlide = 0;
    }
    if (type === 'delay') { newStep.duration = 1; newStep.unit = 'minutes'; }
    if (type === 'condition') newStep.matchKeywords = '';

    setSteps((prev) => {
      const copy = [...prev];
      copy.splice(afterIndex + 1, 0, newStep);
      return copy;
    });
  }, []);

  const updateStep = useCallback((index, updatedStep) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? updatedStep : s)));
  }, []);

  const deleteStep = useCallback((index) => {
    setSteps((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const renderStep = (step, index) => {
    const props = {
      key: step.id,
      step,
      onUpdate: (updated) => updateStep(index, updated),
      onDelete: () => deleteStep(index),
    };

    switch (step.type) {
      case 'message': return <MessageStep {...props} />;
      case 'button_template': return <ButtonTemplateStep {...props} />;
      case 'delay': return <DelayStep {...props} />;
      case 'condition': return <ConditionStep {...props} />;
      default: return <MessageStep {...props} />;
    }
  };

  return (
    <div className="fb-flow-builder">
      <div className="fb-flow-steps">
        {/* Trigger Card */}
        <TriggerCard keyword={keyword} />

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id}>
            <AddStepButton onAdd={(type) => addStep(type, index - 1)} />
            {renderStep(step, index)}
          </div>
        ))}

        {/* Add step at the end */}
        <AddStepButton onAdd={(type) => addStep(type, steps.length - 1)} />

        <div className="fb-end-marker">
          <div className="fb-connector-line" />
          <div className="fb-end-dot">END</div>
        </div>
      </div>
    </div>
  );
}
