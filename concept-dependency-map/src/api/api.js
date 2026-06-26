// ============================================================
// Thin API client. Every function below first tries the real
// endpoint Person B owns. If that fails (404 / network error,
// which is what happens whenever the backend isn't running yet)
// it transparently falls back to an in-memory mock so the UI
// keeps working. Swap MOCK_GRAPH for nothing once the backend
// is live — the calling code never needs to change.
// ============================================================

const BASE_URL = '/api';
const NETWORK_DELAY = [220, 650]; // ms, simulated latency range for mocks

function delay() {
  const [min, max] = NETWORK_DELAY;
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ---------- mock graph store -------------------------------------------

let idCounter = 11;
const nextId = () => String(idCounter++);

const MOCK_CONCEPTS = [
  {
    id: '1',
    position: { x: 40, y: 260 },
    title: 'Variables & Loops',
    description: 'Naming values and repeating work. The terrain everything else is built on.',
    resources: ['CS50: Variables & Loops (video)', 'Python docs: control flow'],
    mastery: 'confident',
  },
  {
    id: '2',
    position: { x: 320, y: 120 },
    title: 'Functions',
    description: 'Packaging behaviour so it can be named, reused, and reasoned about in isolation.',
    resources: ['"Composing Programs" ch. 1.3', 'Practice set: write 5 pure functions'],
    mastery: 'confident',
  },
  {
    id: '3',
    position: { x: 320, y: 420 },
    title: 'Big-O Notation',
    description: 'A vocabulary for how a solution\u2019s cost grows as input grows.',
    resources: ['Big-O cheat sheet', 'visualgo.net complexity demos'],
    mastery: 'learning',
  },
  {
    id: '4',
    position: { x: 600, y: 120 },
    title: 'Recursion',
    description: 'Solving a problem by handing a smaller version of it to yourself.',
    resources: ['"Think Recursively" worksheet', 'Trace-table practice: factorial & Fibonacci'],
    mastery: 'struggling',
  },
  {
    id: '5',
    position: { x: 600, y: 420 },
    title: 'Data Structures',
    description: 'Arrays, lists, stacks, queues \u2014 the containers everything later is stored in.',
    resources: ['Lecture 4 slides', 'Build-your-own linked list exercise'],
    mastery: 'confident',
  },
  {
    id: '6',
    position: { x: 880, y: 420 },
    title: 'Sorting Algorithms',
    description: 'Putting things in order, and what that costs depending on how you do it.',
    resources: ['Sorting visualizer', 'Compare bubble / merge / quick sort'],
    mastery: 'learning',
  },
  {
    id: '7',
    position: { x: 880, y: 200 },
    title: 'Trees',
    description: 'Hierarchies built from nodes \u2014 and the natural home of recursive thinking.',
    resources: ['Binary search tree walkthrough', 'Traversal practice: in/pre/post-order'],
    mastery: 'learning',
  },
  {
    id: '8',
    position: { x: 880, y: 30 },
    title: 'Dynamic Programming',
    description: 'Recursion with a memory \u2014 reusing answers to overlapping smaller problems.',
    resources: ['"DP for beginners" guide', 'Practice: climbing stairs, coin change'],
    mastery: 'learning',
  },
  {
    id: '9',
    position: { x: 1160, y: 200 },
    title: 'Graphs',
    description: 'Trees that are allowed to have cycles and more than one parent. Maps, networks, dependencies.',
    resources: ['BFS/DFS animated guide', 'Build a course-prerequisite graph (yes, like this one)'],
    mastery: 'learning',
  },
  {
    id: '10',
    position: { x: 1160, y: 30 },
    title: 'Greedy Algorithms',
    description: 'Making the locally-best choice at each step and hoping it adds up globally.',
    resources: ['Greedy vs. DP comparison notes'],
    mastery: 'learning',
  },
];

const MOCK_EDGES = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e2-5', source: '2', target: '5' },
  { id: 'e3-6', source: '3', target: '6' },
  { id: 'e5-6', source: '5', target: '6' },
  { id: 'e4-7', source: '4', target: '7' },
  { id: 'e5-7', source: '5', target: '7' },
  { id: 'e4-8', source: '4', target: '8' },
  { id: 'e7-9', source: '7', target: '9' },
  { id: 'e8-10', source: '8', target: '10' },
];

// ---------- public API ---------------------------------------------------

export async function fetchGraph() {
  try {
    return { data: await request('/graph'), mocked: false };
  } catch {
    await delay();
    return {
      data: {
        concepts: MOCK_CONCEPTS.map((c) => ({ ...c, position: { ...c.position } })),
        edges: MOCK_EDGES.map((e) => ({ ...e })),
      },
      mocked: true,
    };
  }
}

export async function createConcept(payload) {
  try {
    return { data: await request('/concepts', { method: 'POST', body: JSON.stringify(payload) }), mocked: false };
  } catch {
    await delay();
    return { data: { id: nextId(), mastery: 'learning', resources: [], ...payload }, mocked: true };
  }
}

export async function updateConceptPosition(id, position) {
  try {
    return {
      data: await request(`/concepts/${id}/position`, { method: 'PATCH', body: JSON.stringify(position) }),
      mocked: false,
    };
  } catch {
    await delay();
    return { data: { id, position }, mocked: true };
  }
}

export async function updateConcept(id, patch) {
  try {
    return { data: await request(`/concepts/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }), mocked: false };
  } catch {
    await delay();
    return { data: { id, ...patch }, mocked: true };
  }
}

export async function deleteConcept(id) {
  try {
    await request(`/concepts/${id}`, { method: 'DELETE' });
    return { mocked: false };
  } catch {
    await delay();
    return { mocked: true };
  }
}

export async function createEdge(source, target) {
  try {
    return {
      data: await request('/edges', { method: 'POST', body: JSON.stringify({ source, target }) }),
      mocked: false,
    };
  } catch {
    await delay();
    return { data: { id: `e${source}-${target}-${nextId()}`, source, target }, mocked: true };
  }
}

export async function deleteEdge(id) {
  try {
    await request(`/edges/${id}`, { method: 'DELETE' });
    return { mocked: false };
  } catch {
    await delay();
    return { mocked: true };
  }
}

export async function updateMastery(conceptId, status) {
  try {
    return {
      data: await request(`/mastery/${conceptId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
      mocked: false,
    };
  } catch {
    await delay();
    return { data: { conceptId, status }, mocked: true };
  }
}

// Person B's route isn't ready yet — mocked exactly as agreed: ["3", "5"].
export async function fetchGaps(conceptId) {
  try {
    return { data: await request(`/gaps/${conceptId}`), mocked: false };
  } catch {
    await delay();
    return { data: { atRisk: ['3', '5'] }, mocked: true };
  }
}
