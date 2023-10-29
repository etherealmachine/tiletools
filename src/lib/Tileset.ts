import { PNGWithMetadata } from "./PNGWithMetadata"
import { clear } from "./draw"

interface TileBuffer {
  tileX: number
  tileY: number
  buf: ImageData
  dirty: boolean
  img?: ImageBitmap
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

  undoStack: TileBuffer[] = [];
  redoStack: TileBuffer[] = [];

  /*
  let tileBuffer: TileImageData | undefined;
  let palette: Set<string> = new Set<string>();
  let copyBuffer: ImageData | undefined;
  let undoStack: TileImageData[] = [];
  let redoStack: TileImageData[] = [];
  */

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
    // TODO: palette from selection
    /*
  function computePalette() {
    const t = getTileBuffer();
    if (!t) return;
    palette.clear();
    for (let x = 0; x < t.data.width; x++) {
      for (let y = 0; y < t.data.height; y++) {
        const i = (y * t.data.width + x) * 4;
        const r = t.data.data[i+0];
        const g = t.data.data[i+1];
        const b = t.data.data[i+2];
        const a = t.data.data[i+3];
        if (r || g || b || a) {
          palette.add("#" + 
            r.toString(16) +
            g.toString(16) +
            b.toString(16) +
            a.toString(16));
        }
      }
    }
    palette = palette;
  }
    */
    return new Set<string>();
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

  download() {
    this.png().download();
  }

  dataURL(): string {
    return this.png().dataURL();
  }

  png(): PNGWithMetadata {
    // TODO: Blit dirty tiles
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
            createImageBitmap(tile.buf).then(img => { 
              tile.img = img;
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
    createImageBitmap(tile.buf).then(img => { 
      tile.img = img;
    });
  }

  /*
  pushStack(buf: TileImageData, stack: TileImageData[], clearRedo: boolean = true) {
    const copy = new ImageData(buf.data.width, buf.data.height);
    for (let i = 0; i < copy.width*copy.height*4; i++) {
      copy.data[i] = buf.data.data[i];
    }
    stack.push({
      tileX: buf.tileX,
      tileY: buf.tileY,
      data: copy,
      dirty: buf.dirty,
    });
    if (clearRedo) {
      redoStack = [];
    }
    undoStack = undoStack.slice(0, Math.min(undoStack.length, 10));
    redoStack = redoStack.slice(0, Math.min(redoStack.length, 10));
  }
    */

  undo() {
    /*
    const t = getTileBuffer();
    if (!t) return;
    const last = undoStack.pop();
    if (!last) return;
    pushStack(t, redoStack, false);
    setTileBuffer(last);
    */
  }

  redo() {
    /*
    const t = getTileBuffer();
    if (!t) return;
    const last = redoStack.pop();
    if (!last) return;
    pushStack(t, undoStack, false);
    setTileBuffer(last);
    */
  }

  copy() {
    /*
    const t = getTileBuffer();
    if (!t) return;
    copyBuffer = new ImageData(t.data.width, t.data.height);
    for (let x = 0; x < copyBuffer.width; x++) {
      for (let y = 0; y < copyBuffer.height; y++) {
        const i = (y * copyBuffer.width + x) * 4;
        copyBuffer.data[i+0] = t.data.data[i+0];
        copyBuffer.data[i+1] = t.data.data[i+1];
        copyBuffer.data[i+2] = t.data.data[i+2];
        copyBuffer.data[i+3] = t.data.data[i+3];
      }
    }
    */
  }

  paste() {
    /*
    const t = getTileBuffer();
    if (!t) return;
    if (!copyBuffer) return;
    pushStack(t, undoStack);
    for (let x = 0; x < copyBuffer.width; x++) {
      for (let y = 0; y < copyBuffer.height; y++) {
        const i = (y * copyBuffer.width + x) * 4;
        const r = copyBuffer.data[i+0];
        const g = copyBuffer.data[i+1];
        const b = copyBuffer.data[i+2];
        const a = copyBuffer.data[i+3];
        if (overwrite) {
          t.data.data[i+0] = r;
          t.data.data[i+1] = g;
          t.data.data[i+2] = b;
          t.data.data[i+3] = a;
        } else {
          t.data.data[i+0] ||= r;
          t.data.data[i+1] ||= g;
          t.data.data[i+2] ||= b;
          t.data.data[i+3] ||= a;
        }
      }
    }
    t.dirty = true;
    setTileBuffer(t);
    */
  }

  flip(axis: string) {
    /*
    copy();
    if (!copyBuffer) return;
    const flip = new ImageData(copyBuffer.width, copyBuffer.height);
    for (let x = 0; x < flip.width; x++) {
      for (let y = 0; y < flip.height; y++) {
        const i = (y * flip.width + x) * 4;
        let j: number;
        if (axis === 'x') {
          j = (y * flip.width + (flip.width-x)) * 4;
        } else {
          j = ((flip.height-y) * flip.width + x) * 4;
        }
        flip.data[i+0] = copyBuffer.data[j+0];
        flip.data[i+1] = copyBuffer.data[j+1];
        flip.data[i+2] = copyBuffer.data[j+2];
        flip.data[i+3] = copyBuffer.data[j+3];
      }
    }
    copyBuffer = flip;
    paste();
    copyBuffer = undefined;
    */
  }

  rotate(degrees: number) {
    /*
    copy();
    if (!copyBuffer) return;
    copyBuffer = rotsprite(copyBuffer, degrees);
    paste();
    copyBuffer = undefined;
    */
  }

  move(ox: number, oy: number) {
    /*
    if (tileset.selectedTiles.length === 1) {
      copy();
      if (!copyBuffer) return;
      const dest = new ImageData(copyBuffer.width, copyBuffer.height);
      for (let x = 0; x < dest.width; x++) {
        for (let y = 0; y < dest.height; y++) {
          const i = (y * dest.width + x) * 4;
          const j = ((y-oy) * dest.width + (x-ox)) * 4;
          dest.data[i+0] = copyBuffer.data[j+0];
          dest.data[i+1] = copyBuffer.data[j+1];
          dest.data[i+2] = copyBuffer.data[j+2];
          dest.data[i+3] = copyBuffer.data[j+3];
        }
      }
      copyBuffer = dest;
      paste();
      copyBuffer = undefined;
    } else if (tileset.img) {
      // TODO: Undo whole selection move
      const bufs = tileset.selectedTiles.map(([tileX, tileY]) => makeTileBuffer(tileX, tileY));
      const tmp = document.createElement('canvas');
      tmp.width = tileset.img.width;
      tmp.height = tileset.img.height;
      const ctx = tmp.getContext('2d');
      if (!ctx) return undefined;
      ctx.drawImage(tileset.img, 0, 0);
      for (let i = 0; i < bufs.length; i++) {
        const buf = bufs[i];
        if (!buf) continue;
        const [x1, y1] = tileset.tileToImgCoords(buf.tileX, buf.tileY);
        ctx.clearRect(x1, y1, tileset.tilewidth, tileset.tileheight);
        const [x2, y2] = tileset.tileToImgCoords(buf.tileX+ox, buf.tileY+oy);
        ctx.clearRect(x2, y2, tileset.tilewidth, tileset.tileheight);
      }
      for (let i = 0; i < bufs.length; i++) {
        const buf = bufs[i];
        if (!buf) continue;
        const [x, y] = tileset.tileToImgCoords(buf.tileX+ox, buf.tileY+oy);
        const tileImg = await createImageBitmap(buf.data);
        ctx.drawImage(tileImg, x, y);
        // TODO: Update selection with moved tile
      }
      tileset.img = await createImageBitmap(ctx.getImageData(0, 0, tmp.width, tmp.height));
      triggerRedraw();
    }
    */
  }

  clear() {
    for (let i = 0; i < this.selectedTiles.length; i++) {
      const [x, y] = this.selectedTiles[i];
      const tile = this.getTileBuffer(x, y);
      clear(tile.buf);
      tile.dirty = true;
      createImageBitmap(tile.buf).then(img => { 
        tile.img = img;
      });
    }
  }

  // x, y is location in world, tileX, tileY is location in tileset
  drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, tileX: number, tileY: number) {
    if (!this.img) return;
    let [dx, dy] = this.tileToWorld(x, y);
    const [sx, sy] = this.tileToImgCoords(tileX, tileY);
    if (this.type === "hex") {
      dx -= this.radius();
      dy -= this.hexHeight() + 4 // TODO: Why?;
    }
    const tile = this.getTileBuffer(tileX, tileY);
    if (tile.dirty && tile.img) {
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