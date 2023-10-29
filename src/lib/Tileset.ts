import { PNGWithMetadata } from "./PNGWithMetadata"
import { clear, colors, copy, flip, shift } from "./draw"
import rotsprite from "./rotsprite"

interface TileBuffer {
  tileX: number
  tileY: number
  buf: ImageData
  dirty: boolean
  img?: ImageBitmap
}

interface Undoable {
  undo: (tileset: Tileset) => void
  redo: (tileset: Tileset) => void
}

export default class Tileset {
  name: string
  img: ImageBitmap | undefined
  type: "square" | "hex"
  tilewidth: number
  tileheight: number
  margin: number
  spacing: number
  tiledata: { [key: number]: { [key: number]: { [key: string]: any } } }
  selectedTiles: number[][] = []

  tiles: TileBuffer[] = []
  rendering: number = 0
  copyBuffer: TileBuffer[] = []
  undoStack: Undoable[] = []
  redoStack: Undoable[] = []

  constructor(args: { [key: string]: any }) {
    this.name = args.name || "";
    this.img = args.img;
    this.type = args.type || "square";
    this.tilewidth = args.tilewidth || 0;
    this.tileheight = args.tileheight || 0;
    this.margin = args.margin || 0;
    this.spacing = args.spacing || 0;
    this.tiledata = args.tiledata || {};
  }

  worldToTile(x: number, y: number): number[] {
    if (!this.tilewidth || !this.tileheight) return [0, 0];
    if (this.type === "hex") {
      return round_axial(
        ((2/3)*x) / this.radius(),
        ((-1/3)*x + Math.sqrt(3)/3*y)/this.radius());
    }
    return [
      Math.floor(x / this.tilewidth),
      Math.floor(y / this.tileheight),
    ];
  }

  tileToWorld(x: number, y: number): number[] {
    if (!this.tilewidth || !this.tileheight) return [0, 0];
    if (this.type === "hex") {
      return [
        this.radius()*(3/2)*x,
        this.radius()*((Math.sqrt(3)/2)*x + Math.sqrt(3)*y),
      ];
    }
    return [
      x*this.tilewidth,
      y*this.tileheight,
    ];
  }

  imgCoordsToTile(x: number, y: number) {
    if (!this.tilewidth || !this.tileheight) return [0, 0];
    return [
      Math.floor((x-this.margin) / (this.tilewidth+this.spacing)),
      Math.floor((y-this.margin) / (this.tileheight+this.spacing)),
    ];
  }

  tileToImgCoords(x: number, y: number) {
    if (!this.tilewidth || !this.tileheight) return [0, 0];
    return [
      x*(this.tilewidth+this.spacing)+this.margin,
      y*(this.tileheight+this.spacing)+this.margin,
    ];
  }

  /*
    Hex Math at https://www.redblobgames.com/grids/hexagons/
       ________
      /        \     |
     /          \    |
    /      __r___\   h
    \            /   |
     \          /    |
      \___w____/     |

    w = Tile Width
    r = Tile Width / 2
    h = √3 * r
  */
  radius(): number {
    return this.tilewidth/2;
  }

  hexHeight(): number {
    return Math.ceil(Math.sqrt(3)*this.radius());
  }

  metadata(): any {
    return {
      name: this.name,
      type: this.type,
      tilewidth: this.tilewidth,
      tileheight: this.tileheight,
      margin: this.margin,
      spacing: this.spacing,
      tiledata: this.tiledata,
    };
  }

  offsetWidth(): number {
    return this.tilewidth + this.spacing;
  }

  offsetHeight(): number {
    return this.tileheight + this.spacing;
  }

  clearSelectedTiles() {
    this.selectedTiles = [];
  }

  setSelectedTile(x: number, y: number) {
    this.selectedTiles = [[x, y]]
  }

  toggleSelectedTile(x: number, y: number) {
    const i = this.selectedTiles.findIndex(([a, b]) => a === x && b === y);
    if (i !== -1) {
      this.selectedTiles.splice(i, 1);
    } else {
      this.selectedTiles.push([x, y]);
    }
  }

  palette(): Set<string> {
    let palette = new Set<string>();
    for (let i = 0; i < this.selectedTiles.length; i++) {
      const tile = this.getTileBuffer(this.selectedTiles[i][0], this.selectedTiles[i][1]);
      palette = new Set([...palette, ...colors(tile.buf)]);
    }
    return palette;
  }

  setSelectionTags(tags: Set<string>) {
    this.selectedTiles.forEach(([x, y]) => {
      // If a single tile is selected, tags replaces the current set
      if (this.selectedTiles.length === 1) {
        this.setTileData(x, y, "tags", Array.from(tags));
      } else { // If multiple tiles are selected, tags add to their set
        const currTags = new Set<string>(this.getTileData(x, y, "tags", []));
        tags.forEach(tag => currTags.add(tag));
        this.setTileData(x, y, "tags", Array.from(currTags));
      }
    });
  }

  selectionTags(): Set<string> {
    let tags = new Set<string>();
    if (this.selectedTiles.length === 0) return tags;
    // If a single tile is selected, return that tile's tags
    if (this.selectedTiles.length === 1) {
      const [x, y] = this.selectedTiles[0];
      return new Set(this.getTileData(x, y, "tags", []));
    }
    // Otherwise, return the intersection of the selected tile's tags
    this.selectedTiles.forEach(([x, y]) => {
      const tileTags = new Set<string>(this.getTileData(x, y, "tags", []));
      if (tags.size == 0) {
        tags = tileTags;
      } else {
        tags = new Set([...tags].filter(tag => tileTags.has(tag)));
      }
    });
    return tags;
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

  widthInTiles(): number {
    if (!this.img) return 0;
    const w = this.offsetWidth();
    if (w === 0) {
      return 0;
    }
    return Math.ceil((this.img.width - this.margin) / w);
  }

  heightInTiles(): number {
    if (!this.img) return 0;
    const h = this.offsetHeight();
    if (h === 0) {
      return 0;
    }
    return Math.ceil((this.img.height - this.margin) / h);
  }

  // Is x and y contained in the tileset's image?
  // x, y in image coordinates
  inBounds(x: number, y: number): boolean {
    return x >= 0 && x <= (this.img?.width || 0) && y >= 0 && y <= (this.img?.width || 0);
  }

  // Is x and y contained in the selection?
  // x, y in image coordinates
  inSelection(x: number, y: number): boolean {
    return this.inBounds(x, y) && this.selectedTiles.some(loc => {
      const [x1, y1] = this.tileToImgCoords(loc[0], loc[1]);
      const [x2, y2] = this.tileToImgCoords(loc[0]+1, loc[1]+1);
      return x >= x1 && x < x2 && y >= y1 && y < y2;
    });
  }

  randSelectedTile(): number[] | undefined {
    if (this.selectedTiles.length === 0) return undefined;
    return this.selectedTiles[Math.floor(Math.random()*this.selectedTiles.length)];
  }

  async download() {
    (await this.png()).download();
  }

  async dataURL(): Promise<string> {
    return (await this.png()).dataURL();
  }

  async png(): Promise<PNGWithMetadata> {
    this.img = await this.syncTiles();
    return new PNGWithMetadata(this.name, this.metadata(), this.img || "");
  }

  setImageFromDataURL(url: string) {
    const img = document.createElement('img');
    img.onload = () => {
      createImageBitmap(img).then(bitmap => {
        this.img = bitmap;
        if (!this.tilewidth || !this.tileheight) return;
        const canvas = document.createElement('canvas');
        canvas.width = this.tilewidth;
        canvas.height = this.tileheight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const [w, h] = [this.widthInTiles(), this.heightInTiles()];
        this.tiles = [];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const [sx, sy] = this.tileToImgCoords(x, y);
            ctx.drawImage(
              this.img,
              sx, sy,
              this.tilewidth, this.tileheight,
              0, 0,
              this.tilewidth, this.tileheight);
            const tile: TileBuffer = {
              tileX: x,
              tileY: y,
              dirty: false,
              buf: ctx.getImageData(0, 0, this.tilewidth, this.tileheight),
            };
            this.tiles.push(tile);
            this.rendering++;
            createImageBitmap(tile.buf).then(img => { 
              tile.img = img;
              this.rendering--;
            });
          }
        }
      });
    };
    img.src = url;
  }

  getTileBuffer(x: number, y: number): TileBuffer {
    return this.tiles[y*this.widthInTiles()+x];
  }

  setPixel(x: number, y: number, r: number, g: number, b: number, a: number) {
    const [tileX, tileY] = this.imgCoordsToTile(x, y);
    const tile = this.getTileBuffer(tileX, tileY);
    x = x % this.offsetWidth();
    y = y % this.offsetHeight();
    if (x >= this.tilewidth || y >= this.tilewidth) return;
    const i = (y*tile.buf.width+x)*4;
    tile.buf.data[i+0] = r;
    tile.buf.data[i+1] = g;
    tile.buf.data[i+2] = b;
    tile.buf.data[i+3] = a;
    tile.dirty = true;
    this.rendering++;
    createImageBitmap(tile.buf).then(img => { 
      tile.img?.close();
      tile.img = img;
      this.rendering--;
    });
  }

  undo() {
    const op = this.undoStack.pop();
    if (!op) return;
    op.undo(this);
    this.redoStack.push(op);
  }

  redo() {
    const op = this.redoStack.pop();
    if (!op) return;
    op.redo(this);
    this.undoStack.push(op);
  }

  cut() {
    this.copyBuffer = [];
    for (let i = 0; i < this.selectedTiles.length; i++) {
      const [x, y] = this.selectedTiles[i];
      const tile = this.getTileBuffer(x, y);
      this.copyBuffer.push({
        tileX: tile.tileX,
        tileY: tile.tileY,
        buf: copy(tile.buf),
        dirty: tile.dirty,
      });
      tile.buf = clear(tile.buf);
      tile.dirty = true;
      this.rendering++;
      createImageBitmap(tile.buf).then(img => { 
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  copy() {
    this.copyBuffer = [];
    for (let i = 0; i < this.selectedTiles.length; i++) {
      const [x, y] = this.selectedTiles[i];
      const tile = this.getTileBuffer(x, y);
      this.copyBuffer.push({
        tileX: tile.tileX,
        tileY: tile.tileY,
        buf: copy(tile.buf),
        dirty: tile.dirty,
      });
    }
  }

  paste() {
    if (this.selectedTiles.length === 0 || this.copyBuffer.length === 0) return;
    const dx = this.selectedTiles[0][0] - this.copyBuffer[0].tileX;
    const dy = this.selectedTiles[0][1] - this.copyBuffer[0].tileY;
    for (let i = 0; i < this.copyBuffer.length; i++) {
      const copy = this.copyBuffer[i];
      const tile = this.getTileBuffer(copy.tileX+dx, copy.tileY+dy);
      if (copy) {
        tile.buf = copy.buf;
        tile.dirty = copy.dirty;
        this.rendering++;
        createImageBitmap(tile.buf).then(img => { 
          tile.img?.close();
          tile.img = img;
          this.rendering--;
        });
      }
    }
  }

  flip(axis: 'x' | 'y') {
    for (let i = 0; i < this.selectedTiles.length; i++) {
      const [x, y] = this.selectedTiles[i];
      const tile = this.getTileBuffer(x, y);
      flip(tile.buf, axis);
      tile.dirty = true;
      this.rendering++;
      createImageBitmap(tile.buf).then(img => { 
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  rotate(degrees: number) {
    for (let i = 0; i < this.selectedTiles.length; i++) {
      const [x, y] = this.selectedTiles[i];
      const tile = this.getTileBuffer(x, y);
      tile.buf = rotsprite(tile.buf, degrees);
      tile.dirty = true;
      this.rendering++;
      createImageBitmap(tile.buf).then(img => { 
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    } 
  }

  move(ox: number, oy: number) {
    for (let i = 0; i < this.selectedTiles.length; i++) {
      const [x, y] = this.selectedTiles[i];
      const tile = this.getTileBuffer(x, y);
      shift(tile.buf, ox, oy);
      tile.dirty = true;
      this.rendering++;
      createImageBitmap(tile.buf).then(img => { 
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  clear() {
    for (let i = 0; i < this.selectedTiles.length; i++) {
      const [x, y] = this.selectedTiles[i];
      const tile = this.getTileBuffer(x, y);
      clear(tile.buf);
      tile.dirty = true;
      this.rendering++;
      createImageBitmap(tile.buf).then(img => { 
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  // x, y is location in world, tileX, tileY is location in tileset
  drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, tileX: number, tileY: number): boolean {
    if (!this.img) return true;
    let [dx, dy] = this.tileToWorld(x, y);
    const [sx, sy] = this.tileToImgCoords(tileX, tileY);
    if (this.type === "hex") {
      dx -= this.radius();
      dy -= this.hexHeight() + 4 // TODO: Why?;
    }
    const tile = this.getTileBuffer(tileX, tileY);
    if (tile.img) {
      ctx.drawImage(
        tile.img,
        0, 0,
        this.tilewidth, this.tileheight,
        dx, dy,
        this.tilewidth, this.tileheight);
    } else {
      ctx.drawImage(
        this.img,
        sx, sy,
        this.tilewidth, this.tileheight,
        dx, dy,
        this.tilewidth, this.tileheight);
    }
    return tile.dirty;
  }

  async syncTiles(): Promise<ImageBitmap> {
    if (this.rendering) throw new Error('cannot sync until tiles are fully rendered');
    const canvas = document.createElement('canvas');
    canvas.width = 2*this.margin+this.offsetWidth()*this.widthInTiles();
    canvas.height = 2*this.margin+this.offsetHeight()*this.heightInTiles();
    const ctx = canvas.getContext('2d');
    if (!ctx) return new Promise((_resolve, reject) => reject('cannot create ctx from canvas'));
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      if (!tile.img) throw new Error('cannot sync until tiles are fully rendered');
      const x = this.margin + tile.tileX*this.offsetWidth();
      const y = this.margin + tile.tileY*this.offsetHeight();
      ctx.drawImage(tile.img, x, y);
    }
    const buf = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return createImageBitmap(buf);
  }

  static fromPNGWithMetadata(png: PNGWithMetadata, into?: Tileset): Tileset {
    const ts = into || new Tileset({});
    ts.setImageFromDataURL(png.dataURL());
    Object.assign(ts, png.metadata);
    return ts;
  }

  static loadFromFile(file: File, into?: Tileset): Promise<Tileset> {
    return new Promise((resolve, reject) => {
      PNGWithMetadata.fromFile(file).then(png => {
        resolve(this.fromPNGWithMetadata(png, into));
      });
    });
  }
}

function round_axial(x: number, y: number): number[] {
  const xgrid = Math.round(x), ygrid = Math.round(y);
  x -= xgrid, y -= ygrid; // remainder
  const dx = Math.round(x + 0.5*y) * (x*x >= y*y ? 1 : 0);
  const dy = Math.round(y + 0.5*x) * (x*x < y*y ? 1 : 0);
  return [xgrid + dx, ygrid + dy];
}