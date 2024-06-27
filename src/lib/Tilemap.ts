import PNGWithMetadata from "./PNGWithMetadata";
import Tiledata from "./Tiledata";
import Tileset from "./Tileset";
import Undoer, { Undoable } from "./Undoer";
import Point from "./Point";
import { Revivifiable, type JSONValue } from "./Revivify";
import Autotile from "./Autotile";

interface Layer {
  [key: string]: JSONValue;
  name: string;
  visible: boolean;
  tiles: { [key: string]: Point };
}

interface TileChange {
  layerIndex: number;
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
      const loc = change.loc.toString();
      if (change.from === undefined) {
        delete tilemap.layers[change.layerIndex].tiles[loc];
      } else {
        tilemap.layers[change.layerIndex].tiles[loc] = change.from;
      }
    }
  }

  redo(tilemap: Tilemap) {
    super.redo(tilemap);
    for (let change of this.layers) {
      tilemap.layers.splice(change.i, 1);
    }
    for (let change of this.tiles) {
      const loc = change.loc.toString();
      if (change.to === undefined) {
        delete tilemap.layers[change.layerIndex].tiles[loc];
      } else {
        tilemap.layers[change.layerIndex].tiles[loc] = change.to;
      }
    }
  }
}

interface CopyBuffer {
  loc: Point;
  layers: (Point | undefined)[];
}

export default class Tilemap {
  name: string = "";
  tileset: Tileset = new Tileset();
  layers: Layer[] = [
    {
      name: "Layer 1",
      visible: true,
      tiles: {},
    },
  ];
  tiledata: Tiledata = new Tiledata();
  selectedLayer: number = 0;
  selectedTiles: Point[] = [];
  undoer: Undoer<Tilemap, TilemapUndoable> = new Undoer(TilemapUndoable);
  copyBuffer: CopyBuffer[] = [];
  autotile: Autotile = new Autotile();

  setFromRandom(loc: Point) {
    const tile = this.tileset.randSelectedTile();
    if (tile) this.set(loc, tile);
  }

  setFromSelection(loc: Point) {
    const first = this.tileset.selectedTiles[0];
    this.set(loc, first);
    for (let i = 1; i < this.tileset.selectedTiles.length; i++) {
      const curr = this.tileset.selectedTiles[i];
      this.set(loc.add(curr.sub(first)), curr);
    }
  }

  set(loc: Point, tile: Point) {
    const key = loc.toString();
    const undo = this.undoer.push();
    undo.tiles.push({
      layerIndex: this.selectedLayer,
      loc,
      from: this.layers[this.selectedLayer].tiles[key],
      to: tile,
    });
    this.layers[this.selectedLayer].tiles[key] = tile;
    this.autotile.update(this, loc);
  }

  get(loc: Point): Point | undefined {
    const key = loc.toString();
    return this.layers[this.selectedLayer].tiles[key];
  }

  fill(loc: Point, max_dist: number = 10) {
    if (this.layers[this.selectedLayer].tiles[loc.toString()]) return;
    const undo = this.undoer.push();
    if (this.selectedTiles.length > 0) {
      for (let tile of this.selectedTiles) {
        const choice = this.tileset.randSelectedTile();
        if (!choice) return;
        const tileLoc = tile.toString();
        undo.tiles.push({
          layerIndex: this.selectedLayer,
          loc: tile,
          from: this.layers[this.selectedLayer].tiles[tileLoc],
          to: choice,
        });
        this.layers[this.selectedLayer].tiles[tileLoc] = choice;
      }
      return;
    }
    const queue: Point[] = [loc];
    while (queue.length > 0) {
      const curr = queue.shift();
      if (!curr) return;
      const choice = this.tileset.randSelectedTile();
      if (!choice) return;
      const currLoc = curr.toString();
      undo.tiles.push({
        layerIndex: this.selectedLayer,
        loc: curr,
        from: this.layers[this.selectedLayer].tiles[currLoc],
        to: choice,
      });
      this.layers[this.selectedLayer].tiles[currLoc] = choice;
      for (let d of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const n = curr.add(new Point(d[0], d[1]));
        if (loc.dist(n) < max_dist) {
          if (!this.layers[this.selectedLayer].tiles[n.toString()]) {
            queue.push(n);
          }
        }
      }
    }
  }

  erase(loc: Point) {
    if (this.selectedTiles.length > 0) {
      const undo = this.undoer.push();
      for (let loc of this.selectedTiles) {
        const key = loc.toString();
        undo.tiles.push({
          layerIndex: this.selectedLayer,
          loc,
          from: this.layers[this.selectedLayer].tiles[key],
          to: undefined,
        });
        delete this.layers[this.selectedLayer].tiles[key];
      }
      return;
    }
    const key = loc.toString();
    const undo = this.undoer.push();
    undo.tiles.push({
      layerIndex: this.selectedLayer,
      loc,
      from: this.layers[this.selectedLayer].tiles[key],
      to: undefined,
    });
    delete this.layers[this.selectedLayer].tiles[key];
  }

  clear() {
    this.undoer.begin();
    for (let loc of this.selectedTiles) {
      this.erase(loc);
    }
    this.undoer.end();
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

  cut() {
    this.copyBuffer = [];
    const undo = this.undoer.push();
    for (let loc of this.selectedTiles) {
      const key = loc.toString();
      this.copyBuffer.push({
        loc: loc,
        layers: this.layers.map((layer) => layer.tiles[key]),
      });
      for (let i = 0; i < this.layers.length; i++) {
        const layer = this.layers[i];
        undo.tiles.push({
          layerIndex: i,
          loc,
          from: layer.tiles[key],
          to: undefined,
        });
        delete layer.tiles[key];
      }
    }
  }

  copy() {
    this.copyBuffer = [];
    for (let loc of this.selectedTiles) {
      const key = loc.toString();
      this.copyBuffer.push({
        loc: loc,
        layers: this.layers.map((layer) => layer.tiles[key]),
      });
    }
  }

  paste() {
    if (this.selectedTiles.length === 0 || this.copyBuffer.length === 0) return;
    const dx = this.selectedTiles[0].x - this.copyBuffer[0].loc.x;
    const dy = this.selectedTiles[0].y - this.copyBuffer[0].loc.y;
    const undo = this.undoer.push();
    for (let copy of this.copyBuffer) {
      const loc = copy.loc.add(new Point(dx, dy));
      const key = loc.toString();
      for (let i = 0; i < copy.layers.length; i++) {
        const tile = copy.layers[i];
        undo.tiles.push({
          layerIndex: i,
          loc,
          from: this.layers[i].tiles[key],
          to: tile,
        });
        if (tile) {
          this.layers[i].tiles[key] = tile;
        } else {
          delete this.layers[i].tiles[key];
        }
      }
    }
  }

  setDoor(from: Point, to: Point) {
    const fromDoor = this.tiledata.get<Point | undefined>(
      from,
      "door",
    );
    const toDoor = this.tiledata.get<Point | undefined>(to, "door");
    if (fromDoor) {
      this.tiledata.set(fromDoor, "door", undefined);
    }
    if (toDoor) {
      this.tiledata.set(toDoor, "door", undefined);
    }
    if (from.equals(to)) {
      this.tiledata.set(from, "door", undefined);
      this.tiledata.set(to, "door", undefined);
    } else {
      this.tiledata.set(from, "door", to.clone());
      this.tiledata.set(to, "door", from.clone());
    }
  }

  clearSelectedTiles() {
    this.selectedTiles = [];
  }

  addSelectedTile(tile: Point) {
    const i = this.selectedTiles.findIndex((t) => t.equals(tile));
    if (i === -1) {
      this.selectedTiles.push(tile.clone());
    }
  }

  setSelectedTile(tile: Point) {
    this.selectedTiles = [tile];
  }

  toggleSelectedTile(tile: Point) {
    const i = this.selectedTiles.findIndex((t) => t.equals(tile));
    if (i !== -1) {
      this.selectedTiles.splice(i, 1);
    } else {
      this.selectedTiles.push(tile.clone());
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let layer of this.layers) {
      if (!layer.visible) continue;
      this.drawLayer(ctx, layer);
    }
  }

  drawLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
    for (let [loc, tile] of Object.entries(layer.tiles).sort((a, b) => {
      const [pa, pb] = [Point.from(a[0]), Point.from(b[0])];
      if (pa.y === pb.y) return pa.x - pb.x;
      return pa.y - pb.y;
    })) {
      this.tileset.drawTile(ctx, Point.from(loc), tile);
    }
  }

  image(): HTMLCanvasElement {
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

  png(): PNGWithMetadata {
    return new PNGWithMetadata(
      this.name,
      {
        name: this.name,
        layers: this.layers,
        tileset: this.tileset,
        tiledata: this.tiledata,
      },
      this.image(),
    );
  }

  dataURL(): string {
    return this.png().dataURL();
  }

  download() {
    this.png().download();
  }

  static async from(source: File | string | ArrayBuffer): Promise<Tilemap> {
    let png: PNGWithMetadata;
    if (source instanceof File) {
      png = await PNGWithMetadata.fromFile(source);
    } else {
      png = new PNGWithMetadata("", {}, source);
    }
    const tilemap = new Tilemap();
    Object.assign(tilemap, png.metadata);
    // TODO: It works but I dislike it
    if (tilemap.tileset instanceof Promise) {
      tilemap.tileset = await tilemap.tileset;
    }
    return tilemap;
  }

  tagsAt(loc: Point): (string[] | undefined)[] | undefined {
    return this.tilesetDataAt<string[]>(loc, "tags");
  }

  tilesetDataAt<T extends JSONValue>(
    loc: Point,
    key: string,
  ): (T | undefined)[] {
    const data = [];
    for (let layer of this.layers) {
      const tile = layer.tiles[loc.toString()];
      if (tile) {
        const td = this.tileset.tiledata.data[tile.toString()];
        data.push(td ? (td[key] as T) : undefined);
      }
    }
    return data;
  }

  filter(fn: (d?: { [key: string]: JSONValue }) => boolean): Point[] {
    const locs: Point[] = [];
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      for (let [loc, tile] of Object.entries(layer.tiles)) {
        if (fn(this.tileset.tiledata.data[tile.toString()])) {
          locs.push(Point.from(loc));
        }
      }
    }
    return locs;
  }

  search() {
    
  }
}
Revivifiable(Tilemap);
