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

export function clear(buf: ImageData): ImageData {
  for (let y = 0; y < buf.height; y++) {
    for (let x = 0; x < buf.width; x++) {
      const i = (y*buf.width+x)*4;
      buf.data[i+0] = 0;
      buf.data[i+1] = 0;
      buf.data[i+2] = 0;
      buf.data[i+3] = 0;
    }
  }
  return buf;
}

export function flip(buf: ImageData, axis: 'x' | 'y'): ImageData {
  const [w, h] = [buf.width, buf.height];
  const flipped = new ImageData(w, h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = (y*w+x)*4;
      const j = axis === 'y' ? (y*w+(w-x-1))*4 : ((h-y-1)*w+x)*4;
      flipped.data[i+0] = buf.data[j+0];
      flipped.data[i+1] = buf.data[j+1];
      flipped.data[i+2] = buf.data[j+2];
      flipped.data[i+3] = buf.data[j+3];
    }
  }
  return flipped
}

export function colors(buf: ImageData): Set<string> {
  const colors = new Set<string>();
  for (let i = 0; i < buf.width*buf.height*4; i += 4) {
    const r = buf.data[i+0];
    const g = buf.data[i+1];
    const b = buf.data[i+2];
    const a = buf.data[i+3];
    if (r || g || b || a) {
      colors.add("#" + 
        r.toString(16) +
        g.toString(16) +
        b.toString(16) +
        a.toString(16));
    }
  }
  return colors;
}