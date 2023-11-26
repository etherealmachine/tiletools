import type { Camera } from "./Camera";
import PNGWithMetadata from "./PNGWithMetadata";
import Point from "./Point";
import type Scene from "./Scene";
import type { Character, Container, Entity } from "./Scene";
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
    case "down":
      ctx.moveTo((x + 0.5) * w, (y + 0.2) * h);
      ctx.lineTo((x + 0.5) * w, (y + 0.8) * h);
      ctx.lineTo((x + 0.2) * w, (y + 0.5) * h);
      ctx.lineTo((x + 0.5) * w, (y + 0.8) * h);
      ctx.lineTo((x + 0.8) * w, (y + 0.5) * h);
      break;
    case "up":
      ctx.moveTo((x + 0.5) * w, (y + 0.8) * h);
      ctx.lineTo((x + 0.5) * w, (y + 0.2) * h);
      ctx.lineTo((x + 0.2) * w, (y + 0.5) * h);
      ctx.lineTo((x + 0.5) * w, (y + 0.2) * h);
      ctx.lineTo((x + 0.8) * w, (y + 0.5) * h);
      break;
    case "left":
      ctx.moveTo((x + 0.8) * w, (y + 0.5) * h);
      ctx.lineTo((x + 0.2) * w, (y + 0.5) * h);
      ctx.lineTo((x + 0.5) * w, (y + 0.2) * h);
      ctx.lineTo((x + 0.2) * w, (y + 0.5) * h);
      ctx.lineTo((x + 0.5) * w, (y + 0.8) * h);
      break;
    case "right":
      ctx.moveTo((x + 0.2) * w, (y + 0.5) * h);
      ctx.lineTo((x + 0.8) * w, (y + 0.5) * h);
      ctx.lineTo((x + 0.5) * w, (y + 0.2) * h);
      ctx.lineTo((x + 0.8) * w, (y + 0.5) * h);
      ctx.lineTo((x + 0.5) * w, (y + 0.8) * h);
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
  camera: Camera,
) {
  if (map.tileset.type === "hex") {
    drawHexGrid(
      ctx,
      map.tileset,
      camera,
      ctx.canvas.width / camera.zoom,
      ctx.canvas.height / camera.zoom,
    );
  } else {
    drawSquareGrid(
      ctx,
      map.tileset,
      camera,
      ctx.canvas.width / camera.zoom,
      ctx.canvas.height / camera.zoom,
    );
  }
}

export function drawHexGrid(
  ctx: CanvasRenderingContext2D,
  tileset: Tileset,
  camera: Camera,
  width: number,
  height: number,
) {
  const radius = tileset.radius();
  const vert = Math.sqrt(3) * radius;
  const horiz = (3 / 2) * radius;
  const halfVert = (1 / 2) * vert;
  let zero = camera.screenToWorld(new Point(0, 0));
  zero.x = Math.floor(zero.x / horiz);
  zero.y = Math.floor(zero.y / vert);
  const [w, h] = [width / horiz, height / vert];
  for (let x = zero.x; x <= zero.x + w; x++) {
    for (let y = zero.y; y <= zero.y + h; y++) {
      drawHexagon(
        ctx,
        x * horiz,
        y * vert + (x % 2 === 0 ? 0 : halfVert),
        radius,
      );
    }
  }
}

export function drawSquareGrid(
  ctx: CanvasRenderingContext2D,
  tileset: Tileset,
  camera: Camera,
  width: number,
  height: number,
) {
  let zero = camera.screenToWorld(new Point(0, 0));
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
  camera: Camera,
  grid: boolean,
  walls: boolean,
  doors: boolean,
  water: boolean,
  selection: boolean,
  previewAt?: Point,
  previewDoor?: { from: Point; to: Point },
) {
  ctx.imageSmoothingEnabled = false;
  ctx.resetTransform();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(
    camera.zoom,
    0,
    0,
    camera.zoom,
    camera.offset.x,
    camera.offset.y,
  );
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ffffff77";

  if (grid) {
    drawMapGrid(ctx, map, camera);
  }
  map.draw(ctx);

  if (previewAt) {
    const randTile = map.tileset.randSelectedTile();
    if (randTile) {
      map.tileset.drawTile(ctx, previewAt, randTile);
    }
  }

  if (walls) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    for (let wall of map.filter(
      (d) => !!d && (d["tags"] as string[]).includes("wall"),
    )) {
      const world = map.tileset.tileToWorld(wall);
      switch (map.tileset.type) {
        case "square":
          drawRect(
            ctx,
            world.x,
            world.y,
            map.tileset.tilewidth,
            map.tileset.tileheight,
          );
          break;
        case "hex":
          drawHexagon(ctx, world.x, world.y, map.tileset.radius());
          break;
      }
    }
  }

  if (water) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
    for (let water of map.filter(
      (d) => !!d && (d["tags"] as string[]).includes("water"),
    )) {
      const world = map.tileset.tileToWorld(water);
      switch (map.tileset.type) {
        case "square":
          drawRect(
            ctx,
            world.x,
            world.y,
            map.tileset.tilewidth,
            map.tileset.tileheight,
          );
          break;
        case "hex":
          drawHexagon(ctx, world.x, world.y, map.tileset.radius());
          break;
      }
    }
  }

  if (doors) {
    for (let [from, to] of map.tiledata.filter<Point>("door")) {
      drawDoorLink(ctx, map.tileset, from, "#FF8000", to, "#FF8000");
    }
  }
  if (previewDoor) {
    drawDoorLink(
      ctx,
      map.tileset,
      previewDoor.from,
      "#FF8000",
      previewDoor.to,
      "#FF8000",
    );
  }

  if (selection) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    map.selectedTiles.forEach((loc) => {
      const world = map.tileset.tileToWorld(loc);
      switch (map.tileset.type) {
        case "square":
          drawRect(
            ctx,
            world.x,
            world.y,
            map.tileset.tilewidth,
            map.tileset.tileheight,
          );
          break;
        case "hex":
          drawHexagon(ctx, world.x, world.y, map.tileset.radius());
          break;
      }
    });
  }
}

export function drawEntity(
  ctx: CanvasRenderingContext2D,
  e: Entity,
  tileset: Tileset,
  highlight?: boolean,
) {
  if (typeof e.sprite === "string") {
    new PNGWithMetadata("", {}, e.sprite).bitmap().then((img) => {
      e.sprite = img;
    });
  } else if (e.sprite instanceof ImageBitmap) {
    const [x, y] = [
      e.position.x * tileset.tilewidth,
      e.position.y * tileset.tileheight,
    ];
    if (highlight) {
      ctx.globalCompositeOperation = "lighter";
    }
    ctx.drawImage(e.sprite, x, y, tileset.tilewidth, tileset.tileheight);
    if (highlight) {
      ctx.globalCompositeOperation = "source-over";
    }
  }
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  mouse?: Point,
) {
  scene.viewport.width = ctx.canvas.width;
  scene.viewport.height = ctx.canvas.height;
  for (let layer of scene.tilemap.layers) {
    if (!layer.visible) continue;
    const sortedTiles = Object.entries(layer.tiles).sort((a, b): number => {
      const [x1, y1] = a[0].split(",").map((v) => parseInt(v));
      const [x2, y2] = b[0].split(",").map((v) => parseInt(v));
      if (y1 === y2) return x1 - x2;
      return y1 - y2;
    });
    for (let [loc, tile] of sortedTiles) {
      const pos = Point.from(loc);
      if (scene.fov) {
        if (scene.seen[loc] || scene.fov.lit.find(pos.equals.bind(pos))) {
          scene.tilemap.tileset.drawTile(ctx, pos, tile);
        }
      } else {
        scene.tilemap.tileset.drawTile(ctx, pos, tile);
      }
    }
    for (let e of scene.entities) {
      if (
        scene.seen[e.position.toString()] ||
        scene.fov?.lit?.find(e.position.equals.bind(e.position))
      ) {
        let highlight = false;
        if (mouse) {
          highlight = scene.camera
            .screenToTile(mouse, scene.tilemap.tileset)
            .equals(e.position);
        }
        drawEntity(ctx, e, scene.tilemap.tileset, highlight);
      }
    }
  }
  for (let loc of Object.keys(scene.seen)) {
    const pos = Point.from(loc);
    if (scene.fov && !scene.fov.lit.find((litPos) => litPos.equals(pos))) {
      ctx.fillStyle = "#000000aa";
      ctx.strokeStyle = "#00000000";
      drawRect(
        ctx,
        pos.x * scene.tilemap.tileset.tilewidth,
        pos.y * scene.tilemap.tileset.tileheight,
        scene.tilemap.tileset.tilewidth,
        scene.tilemap.tileset.tileheight,
        true,
      );
    }
  }
}
