# Waypoint — Concept Dependency Map (Frontend)

A React Flow canvas where educators map prerequisite relationships between
concepts, and students see exactly why they're learning something — and
where a gap further back on the trail might be causing trouble up ahead.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. No backend is required — every API call in
`src/api/api.js` automatically falls back to realistic mock data if the
real endpoint isn't reachable, so the app is fully interactive out of the box.

## Where each task lives

| Task | Files |
| --- | --- |
| 1 — Graph canvas (drag, persist, edge delete, double-click to add) | `components/GraphCanvas.jsx`, `hooks/useGraph.js` |
| 2 — ConceptNode + slide-in side panel | `components/ConceptNode.jsx`, `components/SidePanel.jsx` |
| 3 — Toolbar + Educator/Student modes | `components/Toolbar.jsx`, `App.jsx` (`mode` state) |
| 4 — Mastery tracker | `components/SidePanel.jsx` (toggle), `hooks/useGraph.js` (`setMastery`) |
| 5 — Gap highlight overlay | `hooks/useGraph.js` (`setMastery` → `fetchGaps`), `ConceptNode.jsx` (`gapRisk` badge) |
| 6 — API wiring, loading/error states | `api/api.js`, `hooks/useGraph.js` (`loading`, `error`, `saving`, `mockMode`) |

## How the mock/real backend swap works

Every function in `api/api.js` tries the real `/api/...` endpoint first.
If that request fails — which is exactly what happens right now, since
there's no backend running — it transparently falls back to in-memory
mock data after a small simulated delay. The rest of the app never knows
the difference. Once Person B's routes are live, these calls will just
start succeeding; no calling code needs to change.

The toolbar shows a small **"Demo data"** badge whenever the app is
running on mocks, and a **"Saving…"** indicator whenever a write is in
flight, so it's always clear what state the data is in.

## Interaction reference

- **Educator mode**: drag nodes (position is saved on drop), drag from
  one node's edge to another to add a dependency, double-click empty
  canvas to add a concept there, select an edge or node and press
  Delete/Backspace to remove it.
- **Student mode**: the graph is read-only structurally — no dragging,
  connecting, adding, or deleting. Clicking a waypoint still opens the
  side panel so a student can set their own mastery status.
- **Either mode**: click any waypoint to open the side panel with its
  description, resources, and mastery toggle. Marking a concept
  "Struggling" checks for at-risk downstream concepts and marks them
  with a red "⚠️ gap risk" badge on the canvas.

## Design notes

The visual language is a trail map: concepts are waypoints, dependencies
are dashed trails, and "lost" understanding is, literally, losing the
trail. The background contour-line field, the minimap as a "you are
here" inset, and the mastery colors (moss = confident, brass = learning,
rust = struggling) all come from that one metaphor — see
`src/styles/index.css` for the token system.
