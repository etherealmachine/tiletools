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

export function permutations<T>(arr: T[]): T[][] {
  const result: T[][] = [];

  function backtrack(start: number) {
    if (start === arr.length) {
      result.push([...arr]);
      return;
    }

    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];  // swap
      backtrack(start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];  // backtrack (swap back)
    }
  }

  backtrack(0);
  return result;
}

export function shuffle(a: Array<any>) {
  let i = a.length, j, temp;
  while(--i > 0) {
    j = Math.floor(Math.random()*(i+1));
    temp = a[j];
    a[j] = a[i];
    a[i] = temp;
  }
}

export function floydWarshall<T>(nodes: T[], goal: (n: T) => boolean, neighbors: (n: T) => { neighbor: T, weight: number}[]) {
  const nodeIndex = new Map<T, number>();
  nodes.forEach((node, index) => nodeIndex.set(node, index));

  const dist: number[][] = nodes.map(() => nodes.map(() => Infinity));
  const next: (T | null)[][] = nodes.map(() => nodes.map(() => null));
  
  const goalDist: number[] = nodes.map(() => Infinity);
  const goalNext: (number | undefined)[] = nodes.map(() => undefined);

  nodes.forEach((node, uIdx) => {
    dist[uIdx][uIdx] = 0;
    neighbors(node).forEach(({ neighbor, weight }) => {
      const vIdx = nodeIndex.get(neighbor);
      if (vIdx !== undefined) {
        dist[uIdx][vIdx] = weight;
        next[uIdx][vIdx] = neighbor;
        if (goal(neighbor)) {
          goalDist[uIdx] = weight;
          goalNext[uIdx] = nodeIndex.get(neighbor);
        }
      }
    });
  });
 
  for (let k = 0; k < nodes.length; k++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (dist[i][j] > dist[i][k] + dist[k][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
        if (goal(nodes[k]) && goalDist[i] > dist[i][k]) {
          goalDist[i] = dist[i][k];
          goalNext[i] = k;
        }
      }
    }
  }

  return { goalDist, goalNext };
}