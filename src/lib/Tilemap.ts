import PNGWithMetadata from "./PNGWithMetadata";
import Tileset from "./Tileset";
import Undoer, { Undoable } from "./Undoer";

export interface Tile {
  x: number
  y: number
}

interface Layer {
  name: string
  visible: boolean
  tiles: { [key: string]: Tile }
}

interface TileChange {
  layer: number
  x: number
  y: number
  from?: Tile
  to?: Tile
}

class TilemapUndoable extends Undoable<Tilemap> {

  layers: { i: number, layer: Layer}[] = [];
  tiles: TileChange[] = [];

  undo(tilemap: Tilemap) {
    super.undo(tilemap);
    for (let change of this.layers) {
      tilemap.layers.splice(change.i, 0, change.layer);
    }
    for (let change of this.tiles) {
      const loc = `${change.x},${change.y}`;
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
      const loc = `${change.x},${change.y}`;
      if (change.to === undefined) {
        delete tilemap.layers[change.layer].tiles[loc];
      } else {
        tilemap.layers[change.layer].tiles[loc] = change.to;
      }
    }
  }

}

export default class Tilemap {

  name: string = ""
  tileset?: Tileset
  layers: Layer[] = [{
    name: "Layer 1",
    visible: true,
    tiles: {},
  }]
  tiledata: { [key: number]: { [key: number]: { [key: string]: any } } } = {}
  selectedLayer: number = 0
  undoer: Undoer<Tilemap, TilemapUndoable> = new Undoer(TilemapUndoable)

  set(x: number, y: number, tile?: Tile) {
    if (!this.tileset) return;
    if (!tile) {
      const choice = this.tileset.randSelectedTile();
      if (choice) {
        tile = { x: choice[0], y: choice[1] };
      }
    }
    if (!tile) return;
    const loc = `${x},${y}`;
    const undo = this.undoer.push();
    undo.tiles.push({
      layer: this.selectedLayer,
      x, y,
      from: this.layers[this.selectedLayer].tiles[loc],
      to: tile,
    });
    this.layers[this.selectedLayer].tiles[loc] = tile; 
  }

  fill(x: number, y: number, max_dist: number = 10) {
    if (!this.tileset) return;
    if (this.layers[this.selectedLayer].tiles[`${x},${y}`]) return;
    const queue: number[][] = [[x, y]];
    while (queue.length > 0) {
      const curr = queue.shift();
      if (!curr) return;
      const choice = this.tileset.randSelectedTile();
      if (!choice) return;
      this.layers[this.selectedLayer].tiles[`${curr[0]},${curr[1]}`] = { x: choice[0], y: choice[1] };
      for (let d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const [nx, ny] = [curr[0]+d[0], curr[1]+d[1]];
        if (Math.sqrt(Math.pow(nx-x, 2)+Math.pow(ny-y, 2)) < max_dist) {
          const n = `${nx},${ny}`;
          if (!this.layers[this.selectedLayer].tiles[n]) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  erase(x: number, y: number) {
    const loc = `${x},${y}`;
    const undo = this.undoer.push();
    undo.tiles.push({
      layer: this.selectedLayer,
      x, y,
      from: this.layers[this.selectedLayer].tiles[loc],
      to: undefined,
    });
    delete this.layers[this.selectedLayer].tiles[loc];
  }

  addLayer() {
    this.layers.push({
      name: `Layer ${this.layers.length+1}`,
      visible: true,
      tiles: {},
    });
  }

  removeLayer(i: number) {
    const undo = this.undoer.push();
    undo.layers.push({i, layer: this.layers.splice(i, 1)[0]});
  }

  undo() {
    this.undoer.undo(this);
  }

  redo() {
    this.undoer.redo(this);
  }

  setTileData(x: number, y: number, key: string, value: any) {
    if (!this.tiledata[x]) this.tiledata[x] = {};
    if (!this.tiledata[x][y]) this.tiledata[x][y] = {};
    this.tiledata[x][y][key] = value;
  }

  getTileData<T>(x: number, y: number, key: string, onEmpty: T): T {
    if (!this.tiledata[x]) return onEmpty;
    if (!this.tiledata[x][y]) return onEmpty;
    return this.tiledata[x][y][key];
  }

  drawLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
    if (!this.tileset) return;
    for (let [loc, tile] of Object.entries(layer.tiles).sort((a, b): number => {
      const [x1, y1] = a[0].split(',').map(v => parseInt(v));
      const [x2, y2] = b[0].split(',').map(v => parseInt(v));
      if (y1 === y2) return x1-x2;
      return y1-y2;
    })) {
      if (!tile) continue;
      const [x, y] = loc.split(',').map(v => parseInt(v));
      this.tileset.drawTile(ctx, x, y, tile.x, tile.y);
    }
  }

  canvas(): HTMLCanvasElement {
    let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
    for (let layer of this.layers) {
      for (let loc of Object.keys(layer.tiles)) {
        const [x, y] = loc.split(',').map(v => parseInt(v));
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    const canvas = document.createElement('canvas');
    if (!this.tileset) return canvas;
    canvas.width = this.tileset.tilewidth * (Math.abs(maxX - minX) + 1);
    canvas.height = this.tileset.tileheight * (Math.abs(maxY - minY) + 1);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw 'cannot create ctx from canvas';
    ctx.setTransform(1, 0, 0, 1, -minX*this.tileset.tilewidth, -minY*this.tileset.tileheight);
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
      PNGWithMetadata.fromFile(file).then(png => {
        resolve(this.fromPNGWithMetadata(png, into));
      });
    });
  }

}