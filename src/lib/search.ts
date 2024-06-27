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

  isEmpty() {
    return this.items.length === 0;
  }
}

export function dijkstra<T>(start: T, goal: (n: T) => boolean, neighbors: (n: T) => { neighbor: T, weight: number }[]) {
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
    return path;
  }
  return [];
}