import Point from "./Point";
import Tilemap from "./Tilemap";
import { bfs, dijkstra, floydWarshall, permutations, shuffle } from "./search";

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

function *neighbors(p: Point, filter?: (p: Point) => boolean): Generator<Point> {
  for (const n of NEIGHBOR_PERMS[0]) {
    if (filter === undefined || filter(p)) {
      yield p.add(n);
    }
  }
}

function *randNeighbors(p: Point, filter?: (p: Point) => boolean): Generator<Point> {
  const i = Math.floor(Math.random()*NEIGHBOR_PERMS.length);
  for (const n of NEIGHBOR_PERMS[i]) {
    if (filter === undefined || filter(p)) {
      yield p.add(n);
    }
  }
}

export default class HexMap extends Tilemap {

  size: number;
  margin: number;
  padding: number;
  numPlates: number;

  constructor(size: number=20, margin: number=2, padding: number=1, numPlates: number=10) {
    super()
    this.size = size;
    this.margin = margin;
    this.padding = padding;
    this.numPlates = numPlates;
  }

  generate() {
    this.buildPlates();
    this.unsmoothElevation();
    this.unsmoothElevation();
    this.unsmoothElevation();
  }

  elevationRange(): [number, number] {
    return Object.values(this.tiledata.data).reduce((prev, curr) => {
      const elevation = curr['elevation'];
      if (typeof elevation  === 'number') {
        return [Math.min(prev[0], elevation), Math.max(prev[1], elevation)];
      }
      return prev;
    }, [0, 0]);
  }

  buildPlates() {
    const seeds: Point[] = [];
    for (let loc of spiral(CENTER, this.size)) {
      const p = Point.from(loc);
      if (dist(p, CENTER) < this.size-(this.margin+this.padding)) {
        seeds.push(p);
      }
    }
    shuffle(seeds);
    const plates = [];
    for (let i = 0; i < this.numPlates; i++) {
      const seed = seeds.shift();
      if (!seed) break;
      this.tiledata.set(seed, 'seed', true);
      let elevation: number = 0;
      if (Math.random() < 0.33) {
        // Continental
        elevation = 840 - 600*Math.random();
      } else {
        // Oceanic
        elevation = -3790 + 2000*Math.random();
      }
      plates.push({
        index: i,
        elevation: elevation,
        locs: [seed],
        stack: [seed],
      });
    }
    let progress = 1;
    while (progress) {
      progress = 0;
      for (let plate of plates) {
        const curr = plate.stack.shift();
        if (!curr) continue;
        progress++;
        if (this.tiledata.get(curr, 'index') !== undefined) continue;
        this.tiledata.set(curr, 'index', plate.index);
        this.tiledata.set(curr, 'elevation', plate.elevation);
        for (const n of neighbors(curr)) {
          if (dist(CENTER, n) >= this.size-(this.margin+this.padding)) continue;
          plate.locs.push(n);
          plate.stack.push(n);
        }
      }
    }
  }

  unsmoothElevation() {
    const newElevation = new Map<string, number>();
    for (const [loc, data] of Object.entries(this.tiledata.data)) {
      const curr = Point.from(loc);
      const h = data['elevation'] as number | undefined;
      if (!h) continue;
      let total = h;
      let count = 1;
      for (let n of neighbors(curr)) {
        const nh = this.tiledata.get<number>(n, 'elevation');
        if (nh !== undefined) {
          total += nh;
          count++;
        }
      }
      newElevation.set(loc, total / count);
    }
    for (const [loc, elevation] of newElevation.entries()) {
      this.tiledata.data[loc]['elevation'] = elevation;
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
    const mountains = Array.from(Object.entries(this.tiledata.data)).filter(([_loc, data]) => {
      return data['mountain'];
    }).map(([loc, _data]) => Point.from(loc));
    shuffle(mountains);
    const validNode = (p: Point) => {
      return (
        dist(CENTER, p) < this.size &&
        !this.tiledata.get(p, 'ocean')
      );
    }
    for (const p of mountains) {
      bfs(p, (p) => {
        if (!validNode(p)) return 'continue';
        let sum = this.tiledata.get<number>(p, 'height') || 0;
        let count = sum === 0 ? 0 : 1; 
        for (const n of neighbors(p)) {
          const h = this.tiledata.get<number>(n, 'height');
          if (h !== undefined) {
            sum += h;
            count++;
          }
        }
        this.tiledata.set(p, 'height', sum / count);
      }, (p) => neighbors(p, validNode));
    }
  }

  *weightedNeighbors(p: Point): Generator<[Point, number]> {
    if (dist(CENTER, p) >= this.size) return;
    const h = this.tiledata.get<number>(p, 'height');
    if (h === undefined) return;
    for (const n of randNeighbors(p)) {
      const nh = this.tiledata.get<number>(n, 'height');
      if (nh === undefined) continue;
      yield [n, nh-h];
    }
  }

  erode() {
    const mountains = Array.from(Object.entries(this.tiledata.data)).filter(([_loc, data]) => {
      return data['mountain'];
    }).map(([loc, _data]) => Point.from(loc));
    for (let snowball = 0; snowball < 1000; snowball++) {
      shuffle(mountains);
      const maxIterations = 100;
      const depositionRate = 0.01;
      const erosionRate = 0.01;
      const iterationScale = 0.1;
      let curr = mountains[0];
      let prev = curr;
      let sediment = 0;
      for (let i = 0; i < maxIterations; i++) {
        prev = curr;
        let lowestNeighbor = undefined;
        let minHeight = 0;
        for (const n of neighbors(curr)) {
          if (this.tiledata.get(n, 'mountain')) continue;
          const nh = this.tiledata.get<number>(n, 'height');
          if (nh === undefined) continue;
          if (nh < minHeight) {
            minHeight = nh;
            lowestNeighbor = n;
          }
        }
        if (!lowestNeighbor) break;
        curr = lowestNeighbor;
        const currHeight = this.tiledata.get<number>(curr, 'height');
        const prevHeight = this.tiledata.get<number>(prev, 'height');
        if (currHeight === undefined || prevHeight === undefined) break;
        const slope = (prevHeight -  currHeight) / 40000;
        if (slope <= 0) break;
        const deposit = sediment * depositionRate * slope;
        const erosion = erosionRate * (1 - slope) * Math.min(1, i*iterationScale);
        sediment += erosion - deposit;
      }
    }
  }
}