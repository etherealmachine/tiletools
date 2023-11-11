import PNGWithMetadata from "./PNGWithMetadata";
import Tiledata from "./Tiledata";
import Tileset from "./Tileset";
import Undoer, { Undoable } from "./Undoer";
import Point from "./Point";
import { Revivifiable, type JSONValue } from "./Revivify";

interface Layer {
  [key: string]: JSONValue;
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
      const loc = change.loc.toString();
      if (change.from === undefined) {
        delete tilemap.layers[change.layer].tiles[loc];
      } else {
        tilemap.layers[change.layer].tiles[loc] = change.from;
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
        delete tilemap.layers[change.layer].tiles[loc];
      } else {
        tilemap.layers[change.layer].tiles[loc] = change.to;
      }
    }
  }
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
  undoer: Undoer<Tilemap, TilemapUndoable> = new Undoer(TilemapUndoable);

  set(loc: Point, tile?: Point) {
    if (!tile) {
      tile = this.tileset.randSelectedTile();
    }
    if (!tile) return;
    const key = loc.toString();
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

  setDoor(from: Point, to: Point) {
    const fromDoor = this.tiledata.get<Point | undefined>(
      from,
      "door",
      undefined,
    );
    const toDoor = this.tiledata.get<Point | undefined>(to, "door", undefined);
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

  download() {
    new PNGWithMetadata(
      this.name,
      {
        name: this.name,
        layers: this.layers,
        tileset: this.tileset,
        tiledata: this.tiledata,
      },
      this.image(),
    ).download();
  }

  static async from(file: File): Promise<Tilemap> {
    const png = await PNGWithMetadata.fromFile(file);
    const tilemap = new Tilemap();
    Object.assign(tilemap, png.metadata);
    // TODO: It works but I dislike it
    if (tilemap.tileset instanceof Promise) {
      tilemap.tileset = await tilemap.tileset;
    }
    return tilemap;
  }
}
Revivifiable(Tilemap);
