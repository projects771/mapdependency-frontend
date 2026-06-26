import React, { useState } from 'react';
import './AddConceptDialog.css';

export default function AddConceptDialog({ open, onCancel, onSubmit, submitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourcesText, setResourcesText] = useState('');

  if (!open) return null;

  const reset = () => {
    setTitle('');
    setDescription('');
    setResourcesText('');
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const resources = resourcesText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    onSubmit({ title: title.trim(), description: description.trim(), resources });
    reset();
  };

  return (
    <div className="dialog-overlay" onMouseDown={handleCancel}>
      <form className="dialog-card" onMouseDown={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="dialog-eyebrow font-mono">New waypoint</div>
        <h2 className="dialog-title font-display">Mark a concept</h2>

        <label className="dialog-label" htmlFor="concept-title">
          Title
        </label>
        <input
          id="concept-title"
          className="dialog-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Binary Search"
          autoFocus
          required
        />

        <label className="dialog-label" htmlFor="concept-desc">
          Description
        </label>
        <textarea
          id="concept-desc"
          className="dialog-input dialog-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why does this concept matter, in a sentence or two?"
          rows={3}
        />

        <label className="dialog-label" htmlFor="concept-resources">
          Resources <span className="dialog-label-hint">(one per line)</span>
        </label>
        <textarea
          id="concept-resources"
          className="dialog-input dialog-textarea"
          value={resourcesText}
          onChange={(e) => setResourcesText(e.target.value)}
          placeholder={'Lecture slides\nPractice set link'}
          rows={3}
        />

        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim() || submitting}>
            {submitting ? 'Placing…' : 'Place on map'}
          </button>
        </div>
      </form>
    </div>
  );
}
