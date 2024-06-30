import Point from "./Point";
import Tilemap from "./Tilemap";
import { floydWarshall, permutations, shuffle } from "./search";

const CENTER = new Point(0, 0);
const NEIGHBOR_PERMS: Point[][] = permutations([
  new Point(+1, 0),
  new Point(+1, -1),
  new Point(0, -1), 
  new Point(-1, 0),
  new Point(-1, +1),
  new Point(0, +1),
]);

function *ring(center: Point, radius: number) {
  let hex = center.add(new Point(-1, +1).scale(radius));
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      yield hex;
      hex = hex.add(NEIGHBOR_PERMS[0][i]);
    }
  }
}

function *spiral(center: Point, radius: number) {
  yield center;
  for (let i = 1; i <= radius; i++) {
    const r = ring(center, i);
    for (let p of r) {
      yield p;
    }
  }
}

function dist(a: Point, b: Point): number {
  const vec = a.sub(b);
  return (Math.abs(vec.x) + Math.abs(vec.y) + Math.abs(- vec.x - vec.y)) / 2;
}

function *neighbors(p: Point): Generator<Point> {
  for (const n of NEIGHBOR_PERMS[0]) {
    yield p.add(n);
  }
}

function *randNeighbors(p: Point): Generator<Point> {
  const i = Math.floor(Math.random()*NEIGHBOR_PERMS.length);
  for (const n of NEIGHBOR_PERMS[i]) {
    yield p.add(n);
  }
}

export default class HexMap extends Tilemap {

  size: number;
  margin: number;
  padding: number;

  constructor(size: number=20, margin: number=2, padding: number=1) {
    super()
    this.size = size;
    this.margin = margin;
    this.padding = padding;
  }

  initializeOcean() {
    for (let loc of spiral(CENTER, Infinity)) {
      if (dist(loc, CENTER) > this.size) break;
      if (dist(loc, CENTER) >= this.size - this.margin) {
        this.tiledata.set(loc, 'ocean', true);
      } else {
        this.tiledata.set(loc, 'ocean', true);
      }
    }
  }

  buildContinents(sizes: number[]=[1, 2, 4, 4]) {
    const seeds: Point[] = [];
    for (let loc of Object.keys(this.tiledata.data)) {
      const p = Point.from(loc);
      if (dist(p, CENTER) < this.size-(this.margin+this.padding)) {
        seeds.push(p);
      }
    }
    shuffle(seeds);
    const continents = new Map(sizes.map((size, i) => {
      const seed = seeds.shift() || new Point(0, 0);
      this.tiledata.set(seed, 'continent', i);
      this.tiledata.set(seed, 'height', size);
      return [i, {
        index: i,
        locs: [seed],
        stack: [seed],
      }];
    }));
    let progress = 1;
    while (progress) {
      progress = 0;
      for (let continent of continents.values()) {
        const curr = continent.stack.shift();
        if (!curr) continue;
        progress++;
        const h = this.tiledata.get<number>(curr, 'height') || 0;
        this.tiledata.set(curr, 'ocean', undefined);
        this.tiledata.set(curr, 'continent', continent.index);
        if (h <= 0) continue;
        for (const n of randNeighbors(curr)) {
          if (dist(CENTER, n) >= this.size-(this.margin+this.padding)) continue;
          if (this.tiledata.get(n, 'ocean')) {
            this.tiledata.set(n, 'height', h - Math.random());
            continent.locs.push(n);
            continent.stack.push(n);
          }
        }
      }
    }
  }

  defineMountains() {
    for (const [loc, data] of Object.entries(this.tiledata.data)) {
      const p = Point.from(loc);
      const currContinent = data['continent'];
      if (data['ocean']) {
        data['height'] = 0;
      } else if (Array.from(neighbors(p)).some(n => {
        return (
          this.tiledata.get(n, 'continent') !== currContinent &&
          this.tiledata.get(n, 'ocean') === undefined &&
          !this.tiledata.get(n, 'mountain'));
      })) {
        data['mountain'] = true;
        data['height'] = 4000 + Math.random()*500;
      } else {
        delete data['height'];
      }
    }
  }

  computeElevation() {
    const nodes = Array.from(Object.entries(this.tiledata.data)).filter(([_loc, data]) => {
      return data['continent'] !== undefined;
    }).map(([loc, _data]) => Point.from(loc));
    // I don't like this averaging - I want to get a smooth transition from the
    // mountains to sea level in a single pass. Maybe BFS from the mountains?
    for (let p of nodes) {
      let sum = this.tiledata.get<number>(p, 'height') || 0;
      let count = 1; 
      for (const n of neighbors(p)) {
        const h = this.tiledata.get<number>(n, 'height');
        if (h !== undefined) {
          sum += h;
          count++;
        }
      }
      this.tiledata.set(p, 'height', sum / count);
    }
  }
}