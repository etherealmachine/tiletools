<script lang="ts">
  import type { Tile } from "./Tilemap";

  export let selectedTileset: HTMLImageElement;
  export let tileWidth: number, tileHeight: number;
  export let selectedTileX: number, selectedTileY: number;

  let canvas: HTMLCanvasElement;
  let tiles: Tile[] = [];
  let currQ: number, currR: number;
  let zoom: number = 1;
  let mouseOver: boolean = false;

  $: size = tileWidth/2;
  const sqrt3 = Math.sqrt(3);
  $: horiz = 3/2 * size;
  $: vert = Math.ceil(sqrt3*size);
  $: offsetX = size;
  $: offsetY = vert/2;

  function round_axial(x: number, y: number): number[] {
    const xgrid = Math.round(x), ygrid = Math.round(y);
    x -= xgrid, y -= ygrid; // remainder
    const dx = Math.round(x + 0.5*y) * (x*x >= y*y ? 1 : 0);
    const dy = Math.round(y + 0.5*x) * (x*x < y*y ? 1 : 0);
    return [xgrid + dx, ygrid + dy];
  }

  function screenToWorld(x: number, y: number): number[] {
    return [(x-offsetX)/zoom, (y-offsetY)/zoom];
  }

  function screenToHex(x: number, y: number): number[] {
    const [tx, ty] = screenToWorld(x, y);
    return round_axial(((2/3)*tx) / size, ((-1/3)*tx + sqrt3/3*ty)/size);
  }

  function hexToWorld(q: number, r: number): number[] {
    return [
      size*(3/2)*q,
      size*((sqrt3/2)*q + sqrt3*r),
    ];
  }

  function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    const a = 2*Math.PI/6;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      ctx.lineTo(x + size * Math.cos(a * i), y + size * Math.sin(a * i));
    }
    ctx.closePath();
    ctx.stroke();
  }

  function drawHexTile(ctx: CanvasRenderingContext2D, q: number, r: number, tileset: HTMLImageElement, tileX: number, tileY: number) {
    const [x, y] = hexToWorld(q, r);
    ctx.drawImage(
      tileset,
      tileX*tileWidth, tileY*tileHeight,
      tileWidth, tileHeight,
      // TODO: Why offset by 4?
      x-size, y-vert-6,
      tileWidth*1.01, tileHeight*1.01);
  }

  function draw() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.clearRect(0, 0, W, H);
    ctx.setTransform(zoom, 0, 0, zoom, offsetX, offsetY);
    ctx.strokeStyle = "white";
    for (let q = 0; q < (W/horiz)-1; q++) {
      for (let r = 0; r < (H/vert)-1; r++) {
        const [x, y] = hexToWorld(q, r-Math.floor(q/2));
        drawHexagon(ctx, x, y, size);
      }
    }
    tiles.sort((a: Tile, b: Tile): number => {
      if (b.y === a.y) return a.x - b.x;
      return a.y - b.y;
    })
    for (let tile of tiles) {
      if (tile.tileset && tile.tileset.complete) {
        drawHexTile(ctx, tile.x, tile.y, tile.tileset, tile.tileX, tile.tileY);
      }
    }
    if (selectedTileset && selectedTileset.complete && currQ !== undefined && currR !== undefined) {
      drawHexTile(ctx, currQ, currR, selectedTileset, selectedTileX, selectedTileY);
    }
  }

  function onClick(e: MouseEvent) {
    const [q, r] = screenToHex(e.offsetX, e.offsetY);
    tiles.push({
      tileset: selectedTileset,
      tileX: selectedTileX,
      tileY: selectedTileY,
      x: q,
      y: r,
    });
    draw();
  }

  function onMouseMove(e: MouseEvent) {
    [currQ, currR] = screenToHex(e.offsetX, e.offsetY);
    if (e.buttons === 1) {
      onClick(e);
    } else if (e.ctrlKey) {
      offsetX += e.movementX;
      offsetY += e.movementY;
    }
    requestAnimationFrame(draw);
  }

  function onWheel(e: WheelEvent) {
    const prevZoom = zoom;
    if (e.deltaY < 0) {
      zoom *= 1.1;
    } else if (e.deltaY > 0) {
      zoom *= 0.9;
    }
    zoom = Math.min(Math.max(0.25, zoom), 8);
    offsetX = -zoom*(e.offsetX-offsetX)/prevZoom + e.offsetX;
    offsetY = -zoom*(e.offsetY-offsetY)/prevZoom + e.offsetY;
    requestAnimationFrame(draw);
  }

  function onKeyDown(e: KeyboardEvent) {
    console.log("map");
    if (!mouseOver) return;
    switch (e.key) {
      case "ArrowLeft":
        offsetX += zoom*size;
        e.preventDefault();
        break;
      case "ArrowRight":
        offsetX -= zoom*size;
        e.preventDefault();
        break;
      case "ArrowUp":
        offsetY += zoom*vert;
        e.preventDefault();
        break;
      case "ArrowDown":
        offsetY -= zoom*vert;
        e.preventDefault();
        break;
    }
    requestAnimationFrame(draw);
  }
</script>

<div style="display: flex; flex-direction: column; flex-grow: 1;">
  <canvas
    class="canvas"
    tabindex="1"
    bind:this={canvas}
    on:wheel={onWheel}
    on:mousemove={onMouseMove}
    on:click={onClick}
    on:keydown={onKeyDown}
    on:mouseenter={() => { canvas.focus(); mouseOver = true; }}
    on:mouseleave={() => { mouseOver = false; }}
  />
  <span>{currQ}, {currR}</span>
</div>

<style>
  .canvas {
    border: 2px solid white;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
  }
</style>