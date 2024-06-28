class PriorityQueue<T> {

  items: { element: T, priority: number}[];

  constructor() {
    this.items = [];
  }

  enqueue(element: T, priority: number) {
    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue() {
    return this.items.shift()?.element;
  }

  includes(element: T): boolean {
    return this.items.some(item => item.element === element);
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

export function dijkstra<T>(start: T, goal: (n: T) => boolean, neighbors: (n: T) => { neighbor: T, weight: number }[]): T[] {
  const distances = new Map<T, number>();
  const prev = new Map<T, T>();
  const pq = new PriorityQueue<T>();

  distances.set(start, 0);
  pq.enqueue(start, 0);

  let end: T | undefined;

  while (!pq.isEmpty()) {
    const curr = pq.dequeue();
    if (!curr) break;
    if (goal(curr)) {
      end = curr;
      break;
    }
    let dist = distances.get(curr);

    if (dist === undefined) {
      dist = Infinity;
      distances.set(curr, dist);
    }

    for (const { neighbor, weight } of neighbors(curr)) {
      const alt = dist + weight;
      const nDist = distances.get(neighbor);
      if (nDist === undefined || alt < nDist) {
        distances.set(neighbor, alt);
        prev.set(neighbor, curr);
        pq.enqueue(neighbor, alt);
      }
    }
  }

  if (end) {
    const path = [];
    let curr = end;
    path.push(curr);
    while (true) {
      const next = prev.get(curr);
      if (!next) break;
      path.push(next);
      curr = next;
    }
    // TODO?: Reverse path
    return path;
  }
  return [];
}

export function aStar<T>(start: T, goal: (n: T) => boolean, neighbors: (n: T) => { neighbor: T, weight: number}[], heuristic: (from: T) => number): T[] {
  interface Node {
    el: T,
    g: number,
    h: number,
    parent?: Node,
  }
  const open = new PriorityQueue<Node>();
  const closed = new Set<Node>();
  const graph = new Map<T, Node>();

  const startNode = {
    el: start,
    g: 0,
    h: heuristic(start),
  };
  open.enqueue(startNode, startNode.h);
  graph.set(startNode.el, startNode);

  while (!open.isEmpty()) {
    const curr = open.dequeue();
    if (!curr) break;
    if (goal(curr.el)) {
      // TODO: Reconstruct path
      return [];
    }
    closed.add(curr);
    for (const item of neighbors(curr.el)) {
      const n = graph.get(item.neighbor);
      if (!n) break; // TODO: initialize neighbor
      if (closed.has(n)) continue;
      const gScoreEst = curr.g + 1; // Assuming each move has a cost of 1
      if (!open.includes(n) || gScoreEst < n.g) {
        n.parent = curr;
        n.g = gScoreEst;
        n.h = heuristic(n.el);
        if (!open.includes(n)) {
          open.enqueue(n, n.g+n.h);
        }
      }
    }
  }
  return [];
}

export function greedy<T>(start: T, goal: (n: T) => boolean, neighbors: (n: T) => { neighbor: T, weight: number}[]): T[] {
  const path: T[] = [];
  const queue = new PriorityQueue<T>();
  queue.enqueue(start, 0);
  const visited = new Set<T>();
  while (!queue.isEmpty()) {
    const curr = queue.dequeue();
    if (!curr) break;
    path.push(curr);
    if (goal(curr)) break;
    if (!visited.has(curr)) {
      visited.add(curr);
      for (const { neighbor, weight } of neighbors(curr)) {
        if (!visited.has(neighbor)) {
          queue.enqueue(neighbor, weight);
        }
      }
    }
  }
  return path;
}