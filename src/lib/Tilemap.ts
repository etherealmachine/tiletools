import PNGWithMetadata from "./PNGWithMetadata";
import Tileset from "./Tileset";
import Undoer, { Undoable } from "./Undoer";
import { Point, type JSONValue } from "./types";

interface Layer {
  name: string;
  visible: boolean;
  tiles: { [key: string]: Point };
}

interface TileChange {
  layer: number;
  loc: Point;
  from?: Point;
  to?: Point;
}

class TilemapUndoable extends Undoable<Tilemap> {
  layers: { i: number; layer: Layer }[] = [];
  tiles: TileChange[] = [];

  undo(tilemap: Tilemap) {
    super.undo(tilemap);
    for (let change of this.layers) {
      tilemap.layers.splice(change.i, 0, change.layer);
    }
    for (let change of this.tiles) {
      const key = change.toString();
      if (change.from === undefined) {
        delete tilemap.layers[change.layer].tiles[key];
      } else {
        tilemap.layers[change.layer].tiles[key] = change.from;
      }
    }
  }

  redo(tilemap: Tilemap) {
    super.redo(tilemap);
    for (let change of this.layers) {
      tilemap.layers.splice(change.i, 1);
    }
    for (let change of this.tiles) {
      const key = change.toString();
      if (change.to === undefined) {
        delete tilemap.layers[change.layer].tiles[key];
      } else {
        tilemap.layers[change.layer].tiles[key] = change.to;
      }
    }
  }
}

export default class Tilemap {
  name: string = "";
  tileset?: Tileset;
  layers: Layer[] = [
    {
      name: "Layer 1",
      visible: true,
      tiles: {},
    },
  ];
  tiledata: { [key: string]: { [key: string]: JSONValue } } = {};
  selectedLayer: number = 0;
  undoer: Undoer<Tilemap, TilemapUndoable> = new Undoer(TilemapUndoable);

  set(loc: Point, tile?: Point) {
    if (!this.tileset) return;
    if (!tile) {
      tile = this.tileset.randSelectedTile();
    }
    if (!tile) return;
    const key = tile.toString();
    const undo = this.undoer.push();
    undo.tiles.push({
      layer: this.selectedLayer,
      loc,
      from: this.layers[this.selectedLayer].tiles[key],
      to: tile,
    });
    this.layers[this.selectedLayer].tiles[key] = tile;
  }

  fill(loc: Point, max_dist: number = 10) {
    if (!this.tileset) return;
    if (this.layers[this.selectedLayer].tiles[loc.toString()]) return;
    const queue: Point[] = [loc];
    while (queue.length > 0) {
      const curr = queue.shift();
      if (!curr) return;
      const choice = this.tileset.randSelectedTile();
      if (!choice) return;
      this.layers[this.selectedLayer].tiles[curr.toString()] = choice;
      for (let d of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const n = curr.add(d[0], d[1]);
        if (loc.dist(n) < max_dist) {
          if (!this.layers[this.selectedLayer].tiles[n.toString()]) {
            queue.push(n);
          }
        }
      }
    }
  }

  erase(loc: Point) {
    const key = loc.toString();
    const undo = this.undoer.push();
    undo.tiles.push({
      layer: this.selectedLayer,
      loc,
      from: this.layers[this.selectedLayer].tiles[key],
      to: undefined,
    });
    delete this.layers[this.selectedLayer].tiles[key];
  }

  addLayer() {
    this.layers.push({
      name: `Layer ${this.layers.length + 1}`,
      visible: true,
      tiles: {},
    });
  }

  removeLayer(i: number) {
    const undo = this.undoer.push();
    undo.layers.push({ i, layer: this.layers.splice(i, 1)[0] });
  }

  undo() {
    this.undoer.undo(this);
  }

  redo() {
    this.undoer.redo(this);
  }

  tilesWithData<T>(key: string): [Point, T][] {
    return [];
  }

  setDoor(from: Point, to: Point) {}

  drawLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
    if (!this.tileset) return;
    for (let [loc, tile] of Object.entries(layer.tiles).sort((a, b): number => {
      const [x1, y1] = a[0].split(",").map((v) => parseInt(v));
      const [x2, y2] = b[0].split(",").map((v) => parseInt(v));
      if (y1 === y2) return x1 - x2;
      return y1 - y2;
    })) {
      if (!tile) continue;
      this.tileset.drawTile(ctx, Point.from(loc), tile);
    }
  }

  canvas(): HTMLCanvasElement {
    let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
    for (let layer of this.layers) {
      for (let loc of Object.keys(layer.tiles)) {
        const [x, y] = loc.split(",").map((v) => parseInt(v));
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    const canvas = document.createElement("canvas");
    if (!this.tileset) return canvas;
    canvas.width = this.tileset.tilewidth * (Math.abs(maxX - minX) + 1);
    canvas.height = this.tileset.tileheight * (Math.abs(maxY - minY) + 1);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw "cannot create ctx from canvas";
    ctx.setTransform(
      1,
      0,
      0,
      1,
      -minX * this.tileset.tilewidth,
      -minY * this.tileset.tileheight,
    );
    for (let layer of this.layers) {
      this.drawLayer(ctx, layer);
    }
    return canvas;
  }

  async metadata(): Promise<any> {
    return {
      name: this.name,
      layers: this.layers,
      tiledata: this.tiledata,
      tileset: await this.tileset?.dataURL(),
    };
  }

  async download() {
    (await this.png()).download();
  }

  async dataURL(): Promise<string> {
    return (await this.png()).dataURL();
  }

  async png(): Promise<PNGWithMetadata> {
    return new PNGWithMetadata(this.name, await this.metadata(), this.canvas());
  }

  static fromDataURL(url: string, into?: Tilemap): Tilemap {
    return this.fromPNGWithMetadata(PNGWithMetadata.fromDataURL(url), into);
  }

  static fromPNGWithMetadata(png: PNGWithMetadata, into?: Tilemap): Tilemap {
    const map = into || new Tilemap();
    Object.assign(map, png.metadata);
    map.tileset = Tileset.fromDataURL(png.metadata.tileset);
    return map;
  }

  static loadFromFile(file: File, into?: Tilemap): Promise<Tilemap> {
    return new Promise((resolve, reject) => {
      PNGWithMetadata.fromFile(file).then((png) => {
        resolve(this.fromPNGWithMetadata(png, into));
      });
    });
  }
}
