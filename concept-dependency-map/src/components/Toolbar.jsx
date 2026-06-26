import React from 'react';
import './Toolbar.css';

export default function Toolbar({ mode, onModeChange, onAddConcept, saving, mockMode, error, onDismissError }) {
  return (
    <div className="toolbar-wrap">
      <div className="toolbar">
        <div className="toolbar-brand">
          <span className="toolbar-brand-mark" aria-hidden="true">
            ◈
          </span>
          <div>
            <div className="toolbar-brand-title font-display">Waypoint</div>
            <div className="toolbar-brand-sub font-mono">concept dependency map</div>
          </div>
        </div>

        <div className="toolbar-mode" role="tablist" aria-label="View mode">
          <button
            role="tab"
            aria-selected={mode === 'educator'}
            className={`toolbar-mode-btn ${mode === 'educator' ? 'is-active' : ''}`}
            onClick={() => onModeChange('educator')}
          >
            Educator
          </button>
          <button
            role="tab"
            aria-selected={mode === 'student'}
            className={`toolbar-mode-btn ${mode === 'student' ? 'is-active' : ''}`}
            onClick={() => onModeChange('student')}
          >
            Student
          </button>
        </div>

        <div className="toolbar-controls">
          {mode === 'educator' ? (
            <>
              <button className="btn btn-primary" onClick={onAddConcept}>
                + Add concept
              </button>
              <span className="toolbar-hint">Double-click the map to drop one anywhere · select an edge + Delete to remove it</span>
            </>
          ) : (
            <span className="toolbar-hint">Click any waypoint to set how well you know it</span>
          )}
        </div>

        <div className="toolbar-status">
          {saving && (
            <span className="toolbar-saving">
              <span className="toolbar-saving-dot" /> Saving…
            </span>
          )}
          {mockMode && <span className="toolbar-badge">Demo data</span>}
        </div>
      </div>

      {error && (
        <div className="toolbar-error">
          <span>{error}</span>
          <button className="btn btn-ghost toolbar-error-dismiss" onClick={onDismissError}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
