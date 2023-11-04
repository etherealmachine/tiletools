import PNGWithMetadata from "./PNGWithMetadata";
import Tileset from "./Tileset";

interface Tile {
  tileX: number
  tileY: number
}

interface Layer {
  name: string
  visible: boolean
  tiles: { [key: string]: Tile },
}

export default class Tilemap {

  name: string = ""
  tileset?: Tileset
  layers: Layer[] = [{
    name: "Layer 1",
    visible: true,
    tiles: {},
  }]
  selectedLayer: number = 0
  undoStack: Layer[][] = [];
  redoStack: Layer[][] = [];

  set(x: number, y: number) {
    if (!this.tileset) return;
    const loc = `${x},${y}`;
    const randTile = this.tileset.randSelectedTile();
    if (randTile) {
      this.layers[this.selectedLayer].tiles[loc] = {
        tileX: randTile[0],
        tileY: randTile[1],
      };
    }
  }

  fill(x: number, y: number) {

  }

  erase(x: number, y: number) {
    const loc = `${x},${y}`;
    delete this.layers[this.selectedLayer].tiles[loc];
  }

  undo() {
    const last = this.undoStack.pop();
    if (!last) return;
    this.layers = last;
  }

  redo() {
    const last = this.redoStack.pop();
    if (!last) return;
    this.layers = last;
  }

  addLayer() {
    this.layers.push({
      name: `Layer ${this.layers.length+1}`,
      visible: true,
      tiles: {},
    });
  }

  drawLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
    if (!this.tileset) return;
    for (let [loc, tile] of Object.entries(layer.tiles).sort((a, b): number => {
      const [x1, y1] = a[0].split(',').map(v => parseInt(v));
      const [x2, y2] = b[0].split(',').map(v => parseInt(v));
      if (y1 === y2) return x1-x2;
      return y1-y2;
    })) {
      const [x, y] = loc.split(',').map(v => parseInt(v));
      this.tileset.drawTile(ctx, x, y, tile.tileX, tile.tileY);
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