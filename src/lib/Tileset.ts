import PNGWithMetadata from "./PNGWithMetadata";
import Tiledata from "./Tiledata";
import Undoer, { Undoable } from "./Undoer";
import { clear, colors, copy, flip, shift } from "./draw";
import rotsprite from "./rotsprite";
import Point from "./Point";
import { Revivifiable } from "./Revivify";

interface TileBuffer {
  loc: Point;
  buf: ImageData;
  img?: ImageBitmap;
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface PixelChange {
  tile: Point;
  pixel: Point;
  from: RGBA;
  to: RGBA;
}

class TilesetUndoable extends Undoable<Tileset> {
  tiles: TileBuffer[] = [];
  pixels: PixelChange[] = [];

  addTile({ loc: tile, buf }: TileBuffer) {
    this.tiles.push({ loc: tile, buf: copy(buf) });
  }

  undo(tileset: Tileset) {
    super.undo(tileset);
    for (let prev of this.tiles) {
      const tmp = prev.buf;
      const curr = tileset.getTileBuffer(prev.loc);
      if (!curr) continue;
      prev.buf = curr.buf;
      curr.buf = tmp;
      tileset.rendering++;
      createImageBitmap(curr.buf).then((img) => {
        curr.img?.close();
        curr.img = img;
        tileset.rendering--;
      });
    }
    for (let change of this.pixels) {
      const curr = tileset.getTileBuffer(change.tile);
      if (!curr) continue;
      const i = (change.pixel.y * curr.buf.width + change.pixel.x) * 4;
      curr.buf.data[i + 0] = change.from.r;
      curr.buf.data[i + 1] = change.from.g;
      curr.buf.data[i + 2] = change.from.b;
      curr.buf.data[i + 3] = change.from.a;
      tileset.rendering++;
      createImageBitmap(curr.buf).then((img) => {
        curr.img?.close();
        curr.img = img;
        tileset.rendering--;
      });
    }
  }

  redo(tileset: Tileset) {
    super.redo(tileset);
    for (let prev of this.tiles) {
      const tmp = prev.buf;
      const curr = tileset.getTileBuffer(prev.loc);
      if (!curr) continue;
      prev.buf = curr.buf;
      curr.buf = tmp;
      tileset.rendering++;
      createImageBitmap(curr.buf).then((img) => {
        curr.img?.close();
        curr.img = img;
        tileset.rendering--;
      });
    }
    for (let change of this.pixels) {
      const curr = tileset.getTileBuffer(change.tile);
      if (!curr) continue;
      const i = (change.pixel.y * curr.buf.width + change.pixel.x) * 4;
      curr.buf.data[i + 0] = change.to.r;
      curr.buf.data[i + 1] = change.to.g;
      curr.buf.data[i + 2] = change.to.b;
      curr.buf.data[i + 3] = change.to.a;
      tileset.rendering++;
      createImageBitmap(curr.buf).then((img) => {
        curr.img?.close();
        curr.img = img;
        tileset.rendering--;
      });
    }
  }
}

export default class Tileset {
  name: string = "";
  img: ImageBitmap | undefined;
  type: "square" | "hex" = "square";
  tilewidth: number = 0;
  tileheight: number = 0;
  margin: number = 0;
  spacing: number = 0;
  tiledata: Tiledata = new Tiledata();

  tiles: TileBuffer[] = [];
  rendering: number = 0;
  copyBuffer: TileBuffer[] = [];
  selectedTiles: Point[] = [];
  undoer: Undoer<Tileset, TilesetUndoable> = new Undoer(TilesetUndoable);

  worldToTile(world: Point): Point {
    if (!this.tilewidth || !this.tileheight) return new Point(0, 0);
    if (this.type === "hex") {
      return round_axial(
        new Point(
          ((2 / 3) * world.x) / this.radius(),
          ((-1 / 3) * world.x + (Math.sqrt(3) / 3) * world.y) / this.radius(),
        ),
      );
    }
    return new Point(
      Math.floor(world.x / this.tilewidth),
      Math.floor(world.y / this.tileheight),
    );
  }

  tileToWorld(tile: Point): Point {
    if (!this.tilewidth || !this.tileheight) return new Point(0, 0);
    if (this.type === "hex") {
      return new Point(
        this.radius() * (3 / 2) * tile.x,
        this.radius() * ((Math.sqrt(3) / 2) * tile.x + Math.sqrt(3) * tile.y),
      );
    }
    return new Point(tile.x * this.tilewidth, tile.y * this.tileheight);
  }

  imgCoordsToTile(pixel: Point): Point {
    if (!this.tilewidth || !this.tileheight) return new Point(0, 0);
    return new Point(
      Math.floor((pixel.x - this.margin) / (this.tilewidth + this.spacing)),
      Math.floor((pixel.y - this.margin) / (this.tileheight + this.spacing)),
    );
  }

  tileToImgCoords(tile: Point): Point {
    if (!this.tilewidth || !this.tileheight) return new Point(0, 0);
    return new Point(
      tile.x * (this.tilewidth + this.spacing) + this.margin,
      tile.y * (this.tileheight + this.spacing) + this.margin,
    );
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
    return this.tilewidth / 2;
  }

  hexHeight(): number {
    return Math.ceil(Math.sqrt(3) * this.radius());
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

  palette(): Set<string> {
    let palette = new Set<string>();
    for (let loc of this.selectedTiles) {
      const tile = this.getTileBuffer(loc);
      if (!tile) continue;
      palette = new Set([...palette, ...colors(tile.buf)]);
    }
    return palette;
  }

  setSelectionTags(tags: Set<string>) {
    this.selectedTiles.forEach((loc) => {
      // If a single tile is selected, tags replaces the current set
      if (this.selectedTiles.length === 1) {
        this.tiledata.set(loc, "tags", Array.from(tags));
      } else {
        // TODO: Union and intersection if multiple tiles are selected
        this.tiledata.set(loc, "tags", Array.from(tags));
      }
    });
  }

  selectionTags(): Set<string> {
    let tags = new Set<string>();
    if (this.selectedTiles.length === 0) return tags;
    // If a single tile is selected, return that tile's tags
    if (this.selectedTiles.length === 1) {
      return new Set(this.tiledata.get<string[]>(this.selectedTiles[0], "tags") || []);
    }
    // Otherwise, return the intersection of the selected tile's tags
    this.selectedTiles.forEach((loc) => {
      const tileTags = new Set(this.tiledata.get<string[]>(loc, "tags") || []);
      if (tags.size == 0) {
        tags = tileTags;
      } else {
        tags = new Set([...tags].filter((tag) => tileTags.has(tag)));
      }
    });
    return tags;
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
  inBounds(p: Point): boolean {
    return (
      p.x >= 0 &&
      p.x <= (this.img?.width || 0) &&
      p.y >= 0 &&
      p.y <= (this.img?.width || 0)
    );
  }

  randSelectedTile(): Point | undefined {
    if (this.selectedTiles.length === 0) return undefined;
    return this.selectedTiles[
      Math.floor(Math.random() * this.selectedTiles.length)
    ];
  }

  getTileBuffer(tile: Point): TileBuffer | undefined {
    return this.tiles[tile.y * this.widthInTiles() + tile.x];
  }

  setPixel(pixel: Point, color: RGBA) {
    const tile = this.getTileBuffer(this.imgCoordsToTile(pixel));
    if (!tile) return;
    pixel.x = pixel.x % this.offsetWidth();
    pixel.y = pixel.y % this.offsetHeight();
    if (pixel.x >= this.tilewidth || pixel.y >= this.tileheight) return;
    const i = (pixel.y * tile.buf.width + pixel.x) * 4;
    const prev: RGBA = {
      r: tile.buf.data[i + 0],
      g: tile.buf.data[i + 1],
      b: tile.buf.data[i + 2],
      a: tile.buf.data[i + 3],
    };
    if (
      prev.r === color.r &&
      prev.g === color.g &&
      prev.b === color.b &&
      prev.a === color.a
    )
      return;
    const undo = this.undoer.push();
    undo.pixels.push({
      tile: tile.loc,
      pixel,
      from: prev,
      to: color,
    });
    tile.buf.data[i + 0] = color.r;
    tile.buf.data[i + 1] = color.g;
    tile.buf.data[i + 2] = color.b;
    tile.buf.data[i + 3] = color.a;
    this.rendering++;
    createImageBitmap(tile.buf).then((img) => {
      tile.img?.close();
      tile.img = img;
      this.rendering--;
    });
  }

  fill(point: Point, color: RGBA) {
    const tile = this.getTileBuffer(this.imgCoordsToTile(point));
    if (!tile) return;
    point.x = point.x % this.offsetWidth();
    point.y = point.y % this.offsetHeight();
    if (point.x >= this.tilewidth || point.y >= this.tilewidth) return;
    const i = (point.y * tile.buf.width + point.x) * 4;
    const prev: RGBA = {
      r: tile.buf.data[i + 0],
      g: tile.buf.data[i + 1],
      b: tile.buf.data[i + 2],
      a: tile.buf.data[i + 3],
    };
    if (
      prev.r === color.r &&
      prev.g === color.g &&
      prev.b === color.b &&
      prev.a === color.a
    )
      return;
    const undo = this.undoer.push();
    const matching = this.search(point, (p: Point) => {
      const i = (p.y * tile.buf.width + p.x) * 4;
      const c = {
        r: tile.buf.data[i + 0],
        g: tile.buf.data[i + 1],
        b: tile.buf.data[i + 2],
        a: tile.buf.data[i + 3],
      };
      return prev.r === c.r && prev.g == c.g && prev.b == c.b && prev.a === c.a;
    });
    for (let point of matching) {
      undo.pixels.push({
        tile: point,
        pixel: point,
        from: prev,
        to: color,
      });
      const i = (point.y * tile.buf.width + point.x) * 4;
      tile.buf.data[i + 0] = color.r;
      tile.buf.data[i + 1] = color.g;
      tile.buf.data[i + 2] = color.b;
      tile.buf.data[i + 3] = color.a;
    }
    this.rendering++;
    createImageBitmap(tile.buf).then((img) => {
      tile.img?.close();
      tile.img = img;
      this.rendering--;
    });
  }

  neighbors(point: Point): Point[] {
    const n: Point[] = [];
    if (point.x - 1 >= 0) {
      n.push(new Point(point.x - 1, point.y));
    }
    if (point.x + 1 < this.tilewidth) {
      n.push(new Point(point.x + 1, point.y));
    }
    if (point.y - 1 >= 0) {
      n.push(new Point(point.x, point.y - 1));
    }
    if (point.y + 1 < this.tileheight) {
      n.push(new Point(point.x, point.y + 1));
    }
    return n;
  }

  search(point: Point, filter: (p: Point) => boolean): Point[] {
    const visited: { [key: number]: { [key: number]: boolean } } = {};
    const stack: Point[] = this.neighbors(point);
    const matches: Point[] = [];
    while (stack.length > 0) {
      const curr = stack.pop();
      if (!curr) break;
      if (!visited[curr.x]) visited[curr.x] = {};
      visited[curr.x][curr.y] = true;
      if (!filter(curr)) continue;
      matches.push(curr);
      for (let n of this.neighbors(curr)) {
        if (!(visited[n.x] && visited[n.x][n.y])) {
          stack.push(n);
        }
      }
    }
    return matches;
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
      const tile = this.getTileBuffer(loc);
      if (!tile) continue;
      undo.addTile(tile);
      this.copyBuffer.push({
        loc: tile.loc.clone(),
        buf: copy(tile.buf),
      });
      tile.buf = clear(tile.buf);
      this.rendering++;
      createImageBitmap(tile.buf).then((img) => {
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  copy() {
    this.copyBuffer = [];
    for (let log of this.selectedTiles) {
      const tile = this.getTileBuffer(log);
      if (!tile) continue;
      this.copyBuffer.push({
        loc: tile.loc.clone(),
        buf: copy(tile.buf),
      });
    }
  }

  paste() {
    if (this.selectedTiles.length === 0 || this.copyBuffer.length === 0) return;
    const dx = this.selectedTiles[0].x - this.copyBuffer[0].loc.x;
    const dy = this.selectedTiles[0].y - this.copyBuffer[0].loc.y;
    const undo = this.undoer.push();
    for (let copy of this.copyBuffer) {
      const tile = this.getTileBuffer(copy.loc.add(new Point(dx, dy)));
      if (!tile) continue;
      undo.addTile(tile);
      tile.buf = copy.buf;
      this.rendering++;
      createImageBitmap(tile.buf).then((img) => {
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  flip(axis: "x" | "y") {
    const undo = this.undoer.push();
    for (let loc of this.selectedTiles) {
      const tile = this.getTileBuffer(loc);
      if (!tile) continue;
      undo.addTile(tile);
      flip(tile.buf, axis);
      this.rendering++;
      createImageBitmap(tile.buf).then((img) => {
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  rotate(degrees: number) {
    const undo = this.undoer.push();
    for (let loc of this.selectedTiles) {
      const tile = this.getTileBuffer(loc);
      if (!tile) continue;
      undo.addTile(tile);
      tile.buf = rotsprite(tile.buf, degrees);
      this.rendering++;
      createImageBitmap(tile.buf).then((img) => {
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  move(x: number, y: number) {
    const undo = this.undoer.push();
    for (let loc of this.selectedTiles) {
      const tile = this.getTileBuffer(loc);
      if (!tile) continue;
      undo.addTile(tile);
      shift(tile.buf, x, y);
      this.rendering++;
      createImageBitmap(tile.buf).then((img) => {
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  clear() {
    const undo = this.undoer.push();
    for (let loc of this.selectedTiles) {
      const tile = this.getTileBuffer(loc);
      if (!tile) continue;
      undo.addTile(tile);
      clear(tile.buf);
      this.rendering++;
      createImageBitmap(tile.buf).then((img) => {
        tile.img?.close();
        tile.img = img;
        this.rendering--;
      });
    }
  }

  drawTile(ctx: CanvasRenderingContext2D, world: Point, tileLoc: Point) {
    if (!this.img) return true;
    const dest = this.tileToWorld(world);
    const source = this.tileToImgCoords(tileLoc);
    if (this.type === "hex") {
      dest.x -= this.radius();
      dest.y -= this.hexHeight() + 4; // TODO: Why?;
    }
    const tile = this.getTileBuffer(tileLoc);
    if (!tile) return;
    if (tile.img) {
      ctx.drawImage(
        tile.img,
        0,
        0,
        this.tilewidth,
        this.tileheight,
        dest.x,
        dest.y,
        this.tilewidth,
        this.tileheight,
      );
    } else {
      ctx.drawImage(
        this.img,
        source.x,
        source.y,
        this.tilewidth,
        this.tileheight,
        dest.x,
        dest.y,
        this.tilewidth,
        this.tileheight,
      );
    }
  }

  createTiles() {
    if (!this.img || !this.tilewidth || !this.tileheight || this.rendering)
      return;
    const canvas = document.createElement("canvas");
    canvas.width = this.tilewidth;
    canvas.height = this.tileheight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const [w, h] = [this.widthInTiles(), this.heightInTiles()];
    this.tiles = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const loc = new Point(x, y);
        const source = this.tileToImgCoords(loc);
        ctx.drawImage(
          this.img,
          source.x,
          source.y,
          this.tilewidth,
          this.tileheight,
          0,
          0,
          this.tilewidth,
          this.tileheight,
        );
        const tile: TileBuffer = {
          loc,
          buf: ctx.getImageData(0, 0, this.tilewidth, this.tileheight),
        };
        this.tiles.push(tile);
        this.rendering++;
        createImageBitmap(tile.buf).then((img) => {
          tile.img?.close();
          tile.img = img;
          this.rendering--;
        });
      }
    }
  }

  async syncTiles(): Promise<Tileset> {
    if (this.rendering)
      throw new Error("cannot sync until tiles are fully rendered");
    let [maxX, maxY] = [0, 0];
    for (let tile of this.tiles) {
      if (colors(tile.buf).size > 0) {
        maxX = Math.max(maxX, tile.loc.x);
        maxY = Math.max(maxY, tile.loc.y);
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = 2 * this.margin + this.offsetWidth() * (maxX + 1);
    canvas.height = 2 * this.margin + this.offsetHeight() * (maxY + 1);
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return new Promise((_resolve, reject) =>
        reject("cannot create ctx from canvas"),
      );
    for (let tile of this.tiles) {
      if (!tile.img)
        throw new Error("cannot sync until tiles are fully rendered");
      const x = this.margin + tile.loc.x * this.offsetWidth();
      const y = this.margin + tile.loc.y * this.offsetHeight();
      ctx.drawImage(tile.img, x, y);
    }
    const buf = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.img = await createImageBitmap(buf);
    return this;
  }

  setImageFromDataURL(url: string): Promise<Tileset> {
    return new Promise<Tileset>((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => {
        createImageBitmap(img).then((bitmap) => {
          this.img = bitmap;
          this.createTiles();
          resolve(this);
        });
      };
      img.src = url;
    });
  }

  png(): PNGWithMetadata {
    return new PNGWithMetadata(
      this.name,
      {
        name: this.name,
        tilewidth: this.tilewidth,
        tileheight: this.tileheight,
        type: this.type,
        margin: this.margin,
        spacing: this.spacing,
        tiledata: this.tiledata,
      },
      this.img || "",
    );
  }

  dataURL(): string {
    return this.png().dataURL();
  }

  toJSON() {
    return {
      class: "Tileset",
      data: this.png().dataURL() || null,
    };
  }

  download() {
    this.syncTiles().then((tileset) => {
      tileset.png().download();
    });
  }

  static async from(source: File | ArrayBuffer | string): Promise<Tileset> {
    let png: PNGWithMetadata;
    if (source instanceof File) {
      png = await PNGWithMetadata.fromFile(source);
    } else {
      png = new PNGWithMetadata("", {}, source);
    }
    const tileset = new Tileset();
    Object.assign(tileset, png.metadata);
    await tileset.setImageFromDataURL(png.dataURL());
    // TODO: Remove
    if (!(tileset.tiledata instanceof Tiledata)) {
      tileset.tiledata = new Tiledata();
    }
    return tileset;
  }
}
Revivifiable(Tileset);

function round_axial(p: Point): Point {
  const xgrid = Math.round(p.x);
  const ygrid = Math.round(p.y);
  const x = p.x - xgrid;
  const y = p.y - ygrid;
  const dx = Math.round(x + 0.5 * y) * (x * x >= y * y ? 1 : 0);
  const dy = Math.round(y + 0.5 * x) * (x * x < y * y ? 1 : 0);
  return new Point(xgrid + dx, ygrid + dy);
}
