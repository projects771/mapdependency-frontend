import React, { useCallback, useRef } from 'react';
import ReactFlow, { Controls, MiniMap, SelectionMode, useReactFlow } from 'reactflow';
import ConceptNode from './ConceptNode.jsx';
import TrailEdge from './TrailEdge.jsx';
import './GraphCanvas.css';

const nodeTypes = { concept: ConceptNode };
const edgeTypes = { trail: TrailEdge };

const defaultEdgeOptions = {
  type: 'trail',
};

const MASTERY_COLOR = {
  confident: '#84a08a',
  learning: '#cd9c4f',
  struggling: '#c45a3c',
};

export default function GraphCanvas({
  nodes,
  edges,
  mode,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDragStop,
  onConnect,
  onEdgesDelete,
  onNodesDelete,
  onRequestAddConcept,
}) {
  const wrapperRef = useRef(null);
  const { screenToFlowPosition, project } = useReactFlow();
  const isEducator = mode === 'educator';

  const toFlowPosition = useCallback(
    (clientX, clientY) => {
      // screenToFlowPosition is the modern API; project() is kept as a
      // fallback for older reactflow versions during local upgrades.
      if (screenToFlowPosition) return screenToFlowPosition({ x: clientX, y: clientY });
      const bounds = wrapperRef.current.getBoundingClientRect();
      return project({ x: clientX - bounds.left, y: clientY - bounds.top });
    },
    [screenToFlowPosition, project]
  );

  const handlePaneDoubleClick = useCallback(
    (event) => {
      if (!isEducator) return;
      if (event.target.closest && event.target.closest('.react-flow__node')) return;
      const position = toFlowPosition(event.clientX, event.clientY);
      onRequestAddConcept(position);
    },
    [isEducator, onRequestAddConcept, toFlowPosition]
  );

  const handleEdgesDelete = useCallback(
    (deleted) => {
      if (!isEducator) return;
      onEdgesDelete(deleted);
    },
    [isEducator, onEdgesDelete]
  );

  const handleNodesDelete = useCallback(
    (deleted) => {
      if (!isEducator) return;
      onNodesDelete(deleted);
    },
    [isEducator, onNodesDelete]
  );

  return (
    <div className="graph-canvas-wrapper" ref={wrapperRef} onDoubleClick={handlePaneDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onConnect={isEducator ? onConnect : undefined}
        onEdgesDelete={handleEdgesDelete}
        onNodesDelete={handleNodesDelete}
        nodesDraggable={isEducator}
        nodesConnectable={isEducator}
        elementsSelectable
        deleteKeyCode={isEducator ? ['Backspace', 'Delete'] : []}
        selectionMode={SelectionMode.Partial}
        proOptions={{ hideAttribution: true }}
        zoomOnDoubleClick={false}
        minZoom={0.3}
        maxZoom={1.6}
        fitView
      >
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(n) => MASTERY_COLOR[n.data?.mastery] || '#6a8478'}
          maskColor="rgba(17, 22, 26, 0.75)"
        />
      </ReactFlow>
    </div>
  );
}
