import React from 'react';
import './SidePanel.css';

const MASTERY_OPTIONS = [
  { value: 'learning', label: 'Learning', hint: 'Still working through it' },
  { value: 'confident', label: 'Confident', hint: 'Solid on this' },
  { value: 'struggling', label: 'Struggling', hint: 'Lost on the trail' },
];

export default function SidePanel({ node, mode, onClose, onMasteryChange, onDelete }) {
  const isOpen = Boolean(node);

  return (
    <aside className={`side-panel ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      {node && (
        <>
          <header className="side-panel-header">
            <div className="side-panel-eyebrow font-mono">Waypoint #{node.id}</div>
            <button className="btn btn-ghost side-panel-close" onClick={onClose} aria-label="Close panel">
              ✕
            </button>
          </header>

          <h2 className="side-panel-title font-display">{node.data.title}</h2>

          {node.data.gapRisk && (
            <div className="side-panel-gap-notice">
              ⚠️ This concept is at risk — a prerequisite further back on the trail still needs work.
            </div>
          )}

          <p className="side-panel-description">{node.data.description || 'No description yet.'}</p>

          <section className="side-panel-section">
            <h3 className="side-panel-section-title font-mono">Resources</h3>
            {node.data.resources && node.data.resources.length > 0 ? (
              <ul className="side-panel-resources">
                {node.data.resources.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="side-panel-empty">No resources added yet.</p>
            )}
          </section>

          <section className="side-panel-section">
            <h3 className="side-panel-section-title font-mono">Your status</h3>
            <div className="mastery-toggle" role="group" aria-label="Mastery status">
              {MASTERY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`mastery-option mastery-${opt.value} ${node.data.mastery === opt.value ? 'is-active' : ''}`}
                  onClick={() => onMasteryChange(node.id, opt.value)}
                  title={opt.hint}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {mode === 'educator' && (
            <button className="btn side-panel-delete" onClick={() => onDelete(node.id)}>
              Remove this concept
            </button>
          )}
        </>
      )}
    </aside>
  );
}
