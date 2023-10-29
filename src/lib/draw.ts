import type Tileset from "./Tileset";

export function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    const a = 2*Math.PI/6;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      ctx.lineTo(x + size * Math.cos(a * i), y + size * Math.sin(a * i));
    }
    ctx.closePath();
    ctx.stroke();
  }

export function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.beginPath();
    ctx.lineTo(x, y);
    ctx.lineTo(x+width, y);
    ctx.lineTo(x+width, y+height);
    ctx.lineTo(x, y+height);
    ctx.closePath();
    ctx.stroke();
  }

// x, y is location in world, tileX, tileY is location in tileset
export function drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, tileset: Tileset, tileX: number, tileY: number) {
  if (!tileset.img) return;
  let [dx, dy] = tileset.tileToWorld(x, y);
  const [sx, sy] = tileset.tileToImgCoords(tileX, tileY);
  if (tileset.type === "hex") {
    dx -= tileset.radius();
    dy -= tileset.hexHeight() + 4 // TODO: Why?;
  }
  ctx.drawImage(
    tileset.img,
    sx, sy,
    tileset.tilewidth, tileset.tileheight,
    dx, dy,
    tileset.tilewidth, tileset.tileheight);
}

export function copy(buf: ImageData): ImageData {
  const copy = new ImageData(buf.width, buf.height);
  for (let y = 0; y < buf.height; y++) {
    for (let x = 0; x < buf.width; x++) {
      const i = (y*buf.width+x)*4;
      copy.data[i+0] = buf.data[i+0];
      copy.data[i+1] = buf.data[i+1];
      copy.data[i+2] = buf.data[i+2];
      copy.data[i+3] = buf.data[i+3];
    }
  }
  return copy;
}