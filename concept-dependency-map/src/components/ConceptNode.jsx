import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './ConceptNode.css';

const MASTERY_LABEL = {
  confident: 'Confident',
  learning: 'Learning',
  struggling: 'Struggling',
};

function ConceptNode({ id, data, selected }) {
  const mastery = data.mastery || 'learning';

  return (
    <div className={`concept-node mastery-${mastery} ${selected ? 'is-selected' : ''} ${data.gapRisk ? 'has-gap-risk' : ''}`}>
      <Handle type="target" position={Position.Left} className="concept-handle" />

      {data.gapRisk && (
        <div className="gap-badge" title="This concept is at risk because of an unresolved prerequisite">
          ⚠️ gap risk
        </div>
      )}

      <div className="concept-marker">
        <span className="concept-marker-dot" aria-hidden="true" />
      </div>

      <div className="concept-body">
        <div className="concept-id font-mono">#{id}</div>
        <div className="concept-title font-display">{data.title}</div>
        <div className="concept-status font-mono">{MASTERY_LABEL[mastery]}</div>
      </div>

      <Handle type="source" position={Position.Right} className="concept-handle" />
    </div>
  );
}

export default memo(ConceptNode);
