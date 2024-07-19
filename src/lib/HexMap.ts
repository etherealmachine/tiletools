import Point from "./Point";
import Tilemap from "./Tilemap";
import { bfs, dfs, permutations } from "./search";
import './array_extensions';
import { RNG } from "./rand";

const CENTER = new Point(0, 0);
const NEIGHBOR_PERMS: Point[][] = permutations([
  new Point(0, -1), 
  new Point(+1, -1),
  new Point(+1, 0),
  new Point(0, +1),
  new Point(-1, +1),
  new Point(-1, 0),
]);
const COEFFS: Point[] = [
  new Point(0, -1),
  new Point(0.75, -0.5),
  new Point(0.75, 0.5),
  new Point(0, 1),
  new Point(-0.75, -0.5),
  new Point(-0.75, 0.5),
];

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

function *neighbors(p: Point, filter?: (n: Point) => boolean): Generator<Point> {
  for (const n of NEIGHBOR_PERMS[0]) {
    const np = p.add(n);
    if (filter === undefined || filter(np)) {
      yield np;
    }
  }
}

function shuffle(a: Array<any>, random: () => number) {
  let i = a.length, j, temp;
  while(--i > 0) {
    j = Math.floor(random()*(i+1));
    temp = a[j];
    a[j] = a[i];
    a[i] = temp;
  }
}

export interface Parameters {
  seed: number;
  width: number;
  height: number;
  maxElevation: number;
  plates: number;
  smooth: number;
  ocean: number;
  erosion: number;
  drops: number;
  colors: number;
}

export default class HexMap extends Tilemap {

  params: Parameters;
  rng: RNG;

  constructor(params: Parameters) {
    super()
    this.params = params;
    this.rng = new RNG(params.seed);
  }

  generate() {
    this.plates();
    for (let i = 0; i < this.params.smooth; i++) {
      this.smooth();
    }
    this.gradient();
  }

  range(key: string): [number, number] {
    return Object.values(this.tiledata.data).reduce((prev, curr) => {
      const v = curr[key];
      if (typeof v === 'number') {
        return [Math.min(prev[0], v), Math.max(prev[1], v)];
      }
      return prev;
    }, [Infinity, -Infinity]);
  }

  inBounds(p: Point): boolean {
    return (
      p.x >= -this.params.width/2 &&
      p.x <= this.params.width/2 &&
      (p.y+p.x/2) >= -this.params.height/2 &&
      (p.y+p.x/2) <= this.params.height/2
    );
  }

  groupBy<T>(key: string): Map<T, Point[]> {
    const groups = new Map<T, Point[]>();
    for (const [loc, data] of Object.entries(this.tiledata.data)) {
      const v = data[key] as T | undefined;
      if (v === undefined) continue;
      const a = groups.get(v) || [];
      a.push(Point.from(loc));
      groups.set(v, a);
    }
    return groups;
  }

  plates() {
    const seeds: Point[] = [];
    for (let loc of spiral(CENTER, Math.max(this.params.width, this.params.height))) {
      const p = Point.from(loc);
      if (this.inBounds(p)) {
        seeds.push(p);
      }
    }
    shuffle(seeds, () => this.rng.random());
    const plates = [];
    for (let i = 0; i < this.params.plates; i++) {
      const seed = seeds.shift();
      if (!seed) break;
      this.tiledata.set(seed, 'seed', true);
      let elevation: number = 0;
      if (this.rng.random() > this.params.ocean) {
        // Continental
        elevation = this.params.maxElevation*this.rng.random();
      } else {
        // Oceanic
        elevation = -this.params.maxElevation*this.rng.random();
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
        if (this.tiledata.get(curr, 'plate') !== undefined) continue;
        this.tiledata.set(curr, 'plate', plate.index);
        this.tiledata.set(curr, 'elevation', plate.elevation);
        for (const n of neighbors(curr)) {
          if (!this.inBounds(n)) continue;
          plate.locs.push(n);
          plate.stack.push(n);
        }
      }
    }
    // TODO: Better coloring, BFS plates and avoid neighbor colors
    for (const [loc, data] of Object.entries(this.tiledata.data)) {
      const p = data['plate'] as number | undefined;
      if (p === undefined) continue;
      data['color'] = p % this.params.colors;
    }
  }

  smooth() {
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

  erode() {
    const numPaths = this.params.drops;
    const locs = Object.keys(this.tiledata.data);
    for (let i = 0; i < numPaths; i++) {
      // Start at a random location above sea level
      const start = Point.from(locs[Math.floor(locs.length*this.rng.random())]);
      const elevation = this.tiledata.get<number>(start, 'elevation');
      if (elevation === undefined || elevation <= 0) {
        continue;
      }
      this.erodePath(start);
    }
    this.smooth();
    this.gradient();
  }

  // Erosion/deposition isn't carving through terrain like it should
  erodePath(start: Point, dryRun: boolean = false): Point[] {
    const path: Point[] = [];
    const visited = new Set<string>();
    let curr = start;
    while(true) {
      const e = this.tiledata.get<number>(curr, 'elevation');
      if (e === undefined) break;
      path.push(curr);
      visited.add(curr.toString());
      if (e <= 0) break;
      const ns = Array.from(neighbors(curr, n => {
        if (visited.has(n.toString())) return false;
        const ne = this.tiledata.get<number>(n, 'elevation');
        return ne !== undefined && ne <= e;
      }));
      ns.sort((a, b) => {
        const ea = this.tiledata.get<number>(a, 'elevation') || Infinity;
        const eb = this.tiledata.get<number>(b, 'elevation') || Infinity;
        if (ea < eb) return -1;
        if (ea > eb) return 1;
        return 0;
      })
      if (ns.length === 0) break;
      curr = ns[0];
    }
    if (!dryRun) {
      // TODO: Skip if end of path goes off the map
      // Or maybe make sure map is surrounded by ocean?
      let sediment = 0;
      for (let i = 0; i < path.length; i++) {
        const p = path[i];
        const e = this.tiledata.get<number>(p, 'elevation') || 0;
        const precip = this.tiledata.get<number>(p, 'precipitation') || 0;
        this.tiledata.set(p, 'precipitation', precip+Math.log(i+1));
        if (i < path.length-1) {
          // Want more meandering:
          // Idea: Erode neighbor, deposit at self?
          const erosion = (1-((i+1)/path.length))*this.params.erosion*e;
          sediment = sediment + erosion;
          this.tiledata.set(p, 'elevation', e - erosion);
        } else {
          this.tiledata.set(p, 'elevation', e + sediment);
        }
      }
    }
    return path;
  }

  gradient() {
    let maxMag = 0;
    for (const [loc, data] of Object.entries(this.tiledata.data)) {
      const curr = Point.from(loc);
      const h = data['elevation'] as number | undefined;
      if (!h) continue;
      const grad = new Point(0, 0);
      const ns = Array.from(neighbors(curr));
      for (let i in ns) {
        const n = ns[i];
        const nh = this.tiledata.get<number>(n, 'elevation');
        if (nh !== undefined) {
          grad.x += (h-nh) * COEFFS[i].x;
          grad.y += (h-nh) * COEFFS[i].y;
        }
      }
      data['gradient'] = grad;
      maxMag = Math.max(Math.sqrt(grad.x*grad.x+grad.y*grad.y), maxMag);
    }
    for (const data of Object.values(this.tiledata.data)) {
      const grad = data['gradient'] as Point | undefined;
      if (grad) {
        grad.x /= maxMag;
        grad.y /= maxMag;
      }
    }
  }

  isShoreline(p: Point): boolean {
    const e = this.tiledata.get<number>(p, 'elevation');
    if (e === undefined || e > 0) return false;
    for (const n of neighbors(p)) {
      const ne = this.tiledata.get<number>(n, 'elevation');
      if (ne !== undefined && ne > 0) return true;
    }
    return false;
  }

  watershed() {
    for (const data of Object.values(this.tiledata.data)) {
      delete data['shoreline'];
      delete data['watershed'];
    }
    let watershedIndex = 0;
    for (const loc of Object.keys(this.tiledata.data)) {
      const start = Point.from(loc);
      if ((this.tiledata.get<number>(start, 'elevation') || 0) <= 0) continue;
      const path = this.erodePath(start, true);
      if (path.length === 0) continue;
      const end = path[path.length-1];
      let wi = this.tiledata.get<number>(end, 'watershed');
      if (wi === undefined) {
        wi = watershedIndex;
        watershedIndex++;
      }
      for (const p of path) {
        this.tiledata.set(p, 'watershed', wi);
      }
      if ((this.tiledata.get<number>(end, 'elevation') || NaN) <= 0) {
        this.tiledata.set(end, 'shoreline', true);
        bfs(path[path.length-1], p => {
          this.tiledata.set(p, 'shoreline', true);
          this.tiledata.set(p, 'watershed', wi);
        }, p => {
          return Array.from(neighbors(p, n => this.isShoreline(n)));
        });
      }
    }
    this.mountains();
    this.rivers();
    this.tiles();
  }

  mountains() {
    const watersheds = this.groupBy<number>('watershed');
    for (const [wi, watershed] of watersheds.entries()) {
      dfs(watershed[0], p => {
        if (Array.from(neighbors(p)).some(n => {
          const nwi = this.tiledata.get<number>(n, 'watershed');
          return nwi !== undefined && nwi !== wi;
        })) {
          this.tiledata.set(p, 'divide', true);
        }
      }, p => Array.from(neighbors(p, n => this.tiledata.get<number>(n, 'watershed') === wi)));
    }
  }

  rivers() {
    const watersheds = this.groupBy<number>('watershed');
    for (const watershed of watersheds.values()) {
      const maxPath = watershed.maxBy(p => this.erodePath(p, true).length);
      for (const p of this.erodePath(maxPath, true)) {
        if (!this.tiledata.get(p, 'divide')) {
          this.tiledata.set(p, 'river', true);
        }
      }
    }
  }

  tile(...findTags: string[]): Point {
    const tiledata = this.tileset.tiledata.filter<Array<string>>("tags").find(([_t, tags]) => {
      return findTags.every(tag => tags.includes(tag));
    });
    if (tiledata) {
      return tiledata[0];
    }
    return new Point(0, 0);
  }

  tiles() {
    const grass = this.tile('grassland');
    const shallow = this.tile('shallow water');
    const deep = this.tile('deep water');
    const hills = this.tile('rocky hills');
    const desert = this.tile('desert');
    const swamp = this.tile('swamp', 'wet');
    const mountain = this.tile('mountains');
    const river = this.tile('river');
    this.clear();
    this.addLayer();
    const maxPrecip = this.range('precipitation')[1];
    for (const [loc, data] of Object.entries(this.tiledata.data)) {
      const p = Point.from(loc);
      const water = (data['water'] as number | undefined) || 0;
      const divide = data['divide'] as boolean | undefined;
      const elevation = data['elevation'] as number | undefined;
      if (elevation === undefined) continue;
      if (elevation >= 7000) {
        this.set(p, mountain);
      } else if (divide && elevation >= 5000) {
        this.set(p, mountain);
      } else if (divide) {
        this.set(p, hills);
      } else if (data['shoreline']) {
        this.set(p, shallow);
      } else if (elevation <= 0 && elevation >= -2000) {
        this.set(p, shallow);
      } else if (elevation <= 0) {
        this.set(p, deep);
      } else if (data['river']) {
        this.set(p, grass);
        this.selectedLayer = 1;
        const ns = Array.from(neighbors(p)).map((n, i) => {
          if (this.tiledata.get<boolean>(n, 'river')) {
            return i;
          }
        }).sort().join('');
        console.log(ns);
        this.set(p, this.tile('river', ns));
        this.selectedLayer = 0;
      } else if (water > 0.7*maxPrecip) {
        // Gradient instead of maxWater?
        this.set(p, swamp);
      } else {
        this.set(p, grass);
      }
    }
  }

}