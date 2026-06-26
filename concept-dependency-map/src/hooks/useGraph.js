import { useCallback, useEffect, useRef, useState } from 'react';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import * as api from '../api/api.js';

const NODE_TYPE = 'concept';

function toFlowNode(concept) {
  return {
    id: concept.id,
    type: NODE_TYPE,
    position: concept.position,
    data: {
      title: concept.title,
      description: concept.description,
      resources: concept.resources || [],
      mastery: concept.mastery || 'learning',
      gapRisk: false,
    },
  };
}

export function useGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mockMode, setMockMode] = useState(false);
  const [pendingCount, setPendingCount] = useState(0); // in-flight write count, for a subtle "saving" indicator

  const withPending = useCallback(async (fn) => {
    setPendingCount((c) => c + 1);
    try {
      return await fn();
    } finally {
      setPendingCount((c) => c - 1);
    }
  }, []);

  // initial load -----------------------------------------------------

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, mocked } = await api.fetchGraph();
        if (!alive) return;
        setNodes(data.concepts.map(toFlowNode));
        setEdges(
          data.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: 'trail',
          }))
        );
        setMockMode(mocked);
      } catch (e) {
        if (alive) setError('Couldn\u2019t load the concept map. Try refreshing.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // React Flow change handlers (drag, selection, etc.) ----------------

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // persist a node's position once a drag finishes ---------------------

  const persistNodePosition = useCallback(
    (id, position) => {
      withPending(async () => {
        try {
          await api.updateConceptPosition(id, position);
        } catch {
          setError('Could not save the new position. It will revert on next load.');
        }
      });
    },
    [withPending]
  );

  // add a concept at a canvas position ---------------------------------

  const addConcept = useCallback(
    async (formData, position) => {
      return withPending(async () => {
        try {
          const { data } = await api.createConcept({ ...formData, position });
          const node = toFlowNode({ ...formData, position, id: data.id, mastery: 'learning' });
          setNodes((nds) => nds.concat(node));
          return node;
        } catch {
          setError('Could not add the concept. Please try again.');
          return null;
        }
      });
    },
    [withPending]
  );

  const removeConcept = useCallback(
    (id) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      withPending(async () => {
        try {
          await api.deleteConcept(id);
        } catch {
          setError('Could not delete the concept on the server.');
        }
      });
    },
    [withPending]
  );

  // edges ---------------------------------------------------------------

  const addEdgeBetween = useCallback(
    (source, target) => {
      if (source === target) return;
      withPending(async () => {
        try {
          const { data } = await api.createEdge(source, target);
          setEdges((eds) => eds.concat({ id: data.id, source, target, type: 'trail' }));
        } catch {
          setError('Could not save the new dependency.');
        }
      });
    },
    [withPending]
  );

  const removeEdges = useCallback(
    (edgesToRemove) => {
      const ids = new Set(edgesToRemove.map((e) => e.id));
      setEdges((eds) => eds.filter((e) => !ids.has(e.id)));
      withPending(async () => {
        try {
          await Promise.all(edgesToRemove.map((e) => api.deleteEdge(e.id)));
        } catch {
          setError('Could not delete that dependency on the server.');
        }
      });
    },
    [withPending]
  );

  // mastery + gap detection ----------------------------------------------

  const setMastery = useCallback(
    (id, status) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, mastery: status } } : n))
      );

      withPending(async () => {
        try {
          await api.updateMastery(id, status);
        } catch {
          setError('Could not save mastery status. It will sync next time you reconnect.');
        }
      });

      if (status === 'struggling') {
        withPending(async () => {
          try {
            const { data } = await api.fetchGaps(id);
            const atRisk = new Set(data.atRisk || []);
            setNodes((nds) =>
              nds.map((n) => (atRisk.has(n.id) ? { ...n, data: { ...n.data, gapRisk: true } } : n))
            );
          } catch {
            setError('Could not check for related gaps.');
          }
        });
      } else {
        // clearing a struggle clears the badge this node may have set on itself
        setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, gapRisk: false } } : n)));
      }
    },
    [withPending]
  );

  return {
    nodes,
    edges,
    loading,
    error,
    mockMode,
    saving: pendingCount > 0,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    persistNodePosition,
    addConcept,
    removeConcept,
    addEdgeBetween,
    removeEdges,
    setMastery,
    dismissError: () => setError(null),
  };
}
