import React from 'react';
import { getBezierPath } from 'reactflow';

export default function TrailEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, markerEnd }) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      <path
        id={id}
        d={edgePath}
        className={`trail-edge-path ${selected ? 'is-selected' : ''}`}
        markerEnd={markerEnd}
        fill="none"
      />
    </>
  );
}
