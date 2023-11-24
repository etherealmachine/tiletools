import PNGWithMetadata from "./PNGWithMetadata";
import Point from "./Point";
import type { Character } from "./Scene";
import type Tilemap from "./Tilemap";
import type Tileset from "./Tileset";

export function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const a = (2 * Math.PI) / 6;
  ctx.beginPath();
  for (var i = 0; i < 6; i++) {
    ctx.lineTo(x + size * Math.cos(a * i), y + size * Math.sin(a * i));
  }
  ctx.closePath();
  ctx.stroke();
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: boolean = false,
) {
  ctx.beginPath();
  ctx.lineTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  ctx.stroke();
}

export function copy(buf: ImageData, into?: ImageData): ImageData {
  const copy = into || new ImageData(buf.width, buf.height);
  for (let y = 0; y < buf.height; y++) {
    for (let x = 0; x < buf.width; x++) {
      const i = (y * buf.width + x) * 4;
      copy.data[i + 0] = buf.data[i + 0];
      copy.data[i + 1] = buf.data[i + 1];
      copy.data[i + 2] = buf.data[i + 2];
      copy.data[i + 3] = buf.data[i + 3];
    }
  }
  return copy;
}

export function clear(buf: ImageData) {
  for (let y = 0; y < buf.height; y++) {
    for (let x = 0; x < buf.width; x++) {
      const i = (y * buf.width + x) * 4;
      buf.data[i + 0] = 0;
      buf.data[i + 1] = 0;
      buf.data[i + 2] = 0;
      buf.data[i + 3] = 0;
    }
  }
  return buf;
}

export function flip(buf: ImageData, axis: "x" | "y") {
  const [w, h] = [buf.width, buf.height];
  const flipped = new ImageData(w, h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      const j =
        axis === "y" ? (y * w + (w - x - 1)) * 4 : ((h - y - 1) * w + x) * 4;
      flipped.data[i + 0] = buf.data[j + 0];
      flipped.data[i + 1] = buf.data[j + 1];
      flipped.data[i + 2] = buf.data[j + 2];
      flipped.data[i + 3] = buf.data[j + 3];
    }
  }
  copy(flipped, buf);
}

export function shift(buf: ImageData, ox: number, oy: number) {
  const [w, h] = [buf.width, buf.height];
  const shifted = new ImageData(w, h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const [x1, y1] = [x + ox, y + oy];
      if (x1 < 0 || x1 >= w || y1 < 0 || y1 >= h) continue;
      const i = (y * w + x) * 4;
      const j = (y1 * w + x1) * 4;
      shifted.data[j + 0] = buf.data[i + 0];
      shifted.data[j + 1] = buf.data[i + 1];
      shifted.data[j + 2] = buf.data[i + 2];
      shifted.data[j + 3] = buf.data[i + 3];
    }
  }
  copy(shifted, buf);
}

export function colors(buf: ImageData): Set<string> {
  const colors = new Set<string>();
  for (let i = 0; i < buf.width * buf.height * 4; i += 4) {
    const r = buf.data[i + 0];
    const g = buf.data[i + 1];
    const b = buf.data[i + 2];
    const a = buf.data[i + 3];
    if (r || g || b || a) {
      colors.add(
        "#" + r.toString(16) + g.toString(16) + b.toString(16) + a.toString(16),
      );
    }
  }
  return colors;
}

export function screenToWorld(screen: Point, offset: Point, zoom: number): Point {
  return new Point(
    (screen.x - offset.x) / zoom,
    (screen.y - offset.y) / zoom,
  );
}

export function worldToScreen(world: Point, offset: Point, zoom: number): Point {
  return new Point(world.x * zoom + offset.x, world.y * zoom + offset.y);
}

export function screenToTile(screen: Point, offset: Point, zoom: number, tileset: Tileset): Point {
  const world = screenToWorld(screen, offset, zoom);
  return tileset.worldToTile(world);
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  direction: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const miterLimit = ctx.miterLimit;
  const strokeStyle = ctx.strokeStyle;
  ctx.miterLimit = 1;
  ctx.strokeStyle = "#0000ffff";
  ctx.beginPath();
  switch (direction) {
    case 'down':
      ctx.moveTo((x+0.5)*w, (y+0.2)*h);
      ctx.lineTo((x+0.5)*w, (y+0.8)*h);
      ctx.lineTo((x+0.2)*w, (y+0.5)*h);
      ctx.lineTo((x+0.5)*w, (y+0.8)*h);
      ctx.lineTo((x+0.8)*w, (y+0.5)*h);
      break;
    case 'up':
      ctx.moveTo((x+0.5)*w, (y+0.8)*h);
      ctx.lineTo((x+0.5)*w, (y+0.2)*h);
      ctx.lineTo((x+0.2)*w, (y+0.5)*h);
      ctx.lineTo((x+0.5)*w, (y+0.2)*h);
      ctx.lineTo((x+0.8)*w, (y+0.5)*h);
      break;
    case 'left':
      ctx.moveTo((x+0.8)*w, (y+0.5)*h);
      ctx.lineTo((x+0.2)*w, (y+0.5)*h);
      ctx.lineTo((x+0.5)*w, (y+0.2)*h);
      ctx.lineTo((x+0.2)*w, (y+0.5)*h);
      ctx.lineTo((x+0.5)*w, (y+0.8)*h);
      break;
    case 'right':
      ctx.moveTo((x+0.2)*w, (y+0.5)*h);
      ctx.lineTo((x+0.8)*w, (y+0.5)*h);
      ctx.lineTo((x+0.5)*w, (y+0.2)*h);
      ctx.lineTo((x+0.8)*w, (y+0.5)*h);
      ctx.lineTo((x+0.5)*w, (y+0.8)*h);
      break;
  }
  ctx.stroke();
  ctx.miterLimit = miterLimit;
  ctx.strokeStyle = strokeStyle;
}

export function drawDoor(
  ctx: CanvasRenderingContext2D,
  tileset: Tileset,
  tile: Point,
  color: string,
) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.strokeRect(
    tile.x * tileset.tilewidth,
    tile.y * tileset.tileheight,
    tileset.tilewidth,
    tileset.tileheight,
  );
}

export function drawDoorLink(
  ctx: CanvasRenderingContext2D,
  tileset: Tileset,
  from: Point,
  fromColor: string,
  to: Point,
  toColor: string,
) {
  if (tileset.type === "hex") {
  } else {
    drawDoor(ctx, tileset, from, fromColor);
    ctx.beginPath();
    ctx.moveTo(
      (from.x + 0.5) * tileset.tilewidth,
      (from.y + 0.5) * tileset.tileheight,
    );
    ctx.lineTo(
      (to.x + 0.5) * tileset.tilewidth,
      (to.y + 0.5) * tileset.tileheight,
    );
    ctx.stroke();
    drawDoor(ctx, tileset, to, toColor);
  }
}

export function drawMapGrid(
  ctx: CanvasRenderingContext2D,
  map: Tilemap,
  offset: Point,
  zoom: number,
) {
  if (map.tileset.type === "hex") {
    drawHexGrid(ctx, map.tileset, offset, zoom, ctx.canvas.width*zoom, ctx.canvas.height*zoom);
  } else {
    drawSquareGrid(ctx, map.tileset, offset, zoom, ctx.canvas.width*zoom, ctx.canvas.height*zoom);
  }
}

export function drawHexGrid(
  ctx: CanvasRenderingContext2D,
  tileset: Tileset,
  offset: Point,
  zoom: number,
  width: number,
  height: number,
) {
  const radius = tileset.radius();
  const vert = Math.sqrt(3) * radius;
  const horiz = (3 / 2) * radius;
  const halfVert = (1 / 2) * vert;
  let zero = screenToWorld(new Point(0, 0), offset, zoom);
  zero.x = Math.floor(zero.x / horiz);
  zero.y = Math.floor(zero.y / vert);
  const [w, h] = [width / horiz, height/ vert];
  for (let x = zero.x; x <= zero.x + w; x++) {
    for (let y = zero.y; y <= zero.y + h; y++) {
      drawHexagon(ctx, x * horiz, y * vert + ((x%2===0) ? 0 : halfVert), radius);
    }
  }
}

export function drawSquareGrid(
  ctx: CanvasRenderingContext2D,
  tileset: Tileset,
  offset: Point,
  zoom: number,
  width: number,
  height: number,
) {
  let zero = screenToWorld(new Point(0, 0), offset, zoom);
  zero.x = Math.floor(zero.x / tileset.tilewidth);
  zero.y = Math.floor(zero.y / tileset.tileheight);
  const [w, h] = [width / tileset.tilewidth, height / tileset.tileheight];
  for (let x = zero.x; x <= zero.x + w; x++) {
    for (let y = zero.y; y <= zero.y + h; y++) {
      drawRect(
        ctx,
        x * tileset.tilewidth,
        y * tileset.tileheight,
        tileset.tilewidth,
        tileset.tileheight,
      );
    }
  }
}

export function drawMap(
  ctx: CanvasRenderingContext2D,
  map: Tilemap,
  offset: Point,
  zoom: number,
  grid: boolean,
  doorLinks: boolean,
  selection: boolean,
  previewAt?: Point,
  previewDoor?: { from: Point, to: Point },
) {
  ctx.imageSmoothingEnabled = false;
  ctx.resetTransform();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(zoom, 0, 0, zoom, offset.x, offset.y);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ffffff77";

  if (grid) {
    drawMapGrid(ctx, map, offset, zoom);
  }
  map.draw(ctx);
  if (doorLinks) {
    for (let [from, to] of map.tiledata.filter<Point>("door")) {
      drawDoorLink(
        ctx,
        map.tileset,
        from, "#FF8000",
        to, "#FF8000");
    }
  }
  if (previewAt) {
    const randTile = map.tileset.randSelectedTile();
    if (randTile) {
      map.tileset.drawTile(ctx, previewAt, randTile);
    }
  }
  if (previewDoor) {
    drawDoorLink(ctx, map.tileset, previewDoor.from, "#FF8000", previewDoor.to, "#FF8000");
  }

  if (selection) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    map.selectedTiles.forEach((loc) => {
      const world = map.tileset.tileToWorld(loc);
      switch (map.tileset.type) {
        case "square":
          drawRect(ctx, world.x, world.y, map.tileset.tilewidth, map.tileset.tileheight);
          break;
        case "hex":
          drawHexagon(
            ctx,
            world.x,
            world.y,
            map.tileset.radius(),
          );
          break;
      }
    });
  }
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  c: Character,
  tileset: Tileset,
) {
  if (typeof c.token === "string") {
    new PNGWithMetadata("", {}, c.token)
      .bitmap()
      .then((img) => {
        c.token = img;
      });
  } else if (c.token instanceof ImageBitmap) {
    const [x, y] = [c.position.x * tileset.tilewidth, c.position.y * tileset.tileheight];
    ctx.drawImage(c.token, x, y, tileset.tilewidth, tileset.tileheight);
    ctx.fillStyle = "red";
    ctx.fillRect(
      x,
      y - 1,
      tileset.tilewidth * (c.health.current / c.health.max),
      1,
    );
  }
}

export function drawCharacters() {

}