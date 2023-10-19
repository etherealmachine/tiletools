<script lang="ts">
  import Icon from "./Icon.svelte";
  import { PNGWithMetadata } from "./PNGWithMetadata";
  import Tileset from "./Tileset";

  export let tileset: Tileset | undefined;
  export let selectedTileX: number, selectedTileY: number;

  interface Tile {
    tileset: Tileset
    tileX: number
    tileY: number
  }

  interface Layer {
    name: string
    visible: boolean
    tiles: { [key: string]: Tile },
  }

  let canvas: HTMLCanvasElement;
  let name: string;
  let layers: Layer[] = [{
    name: "Layer 1",
    visible: true,
    tiles: {},
  }];
  let editingLayers: boolean = false;
  let selectedLayerIndex: number = 0;
  let hoverX: number, hoverY: number;
  let grid: boolean = true;
  let zoom: number = 1;
  let mouseOver: boolean = false;
  let offsetX: number = 0, offsetY: number = 0;

  function screenToWorld(x: number, y: number): number[] {
    return [(x-offsetX)/zoom, (y-offsetY)/zoom];
  }

  function screenToTile(x: number, y: number): number[] {
    const [tx, ty] = screenToWorld(x, y);
    if (!tileset) return [0, 0];
    return tileset.worldToTile(tx, ty);
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

  function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.beginPath();
    ctx.lineTo(x, y);
    ctx.lineTo(x+width, y);
    ctx.lineTo(x+width, y+height);
    ctx.lineTo(x, y+height);
    ctx.closePath();
    ctx.stroke();
  }

  // x, y is location in world, tileX, tileY is location in tileset
  function drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, tileset: Tileset, tileX: number, tileY: number) {
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

  function draw() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.clearRect(0, 0, W, H);
    ctx.setTransform(zoom, 0, 0, zoom, offsetX, offsetY);
    ctx.strokeStyle = "white";
    if (grid && tileset && tileset.tilewidth > 0 && tileset.tileheight > 0) {
      if (tileset.type === "hex") {
        const radius = tileset.radius();
        const horiz = Math.sqrt(3)*radius;
        const vert = (3/2)*radius;
        for (let q = 0; q < (W/horiz)-1; q++) {
          for (let r = 0; r < (H/vert)-1; r++) {
            const [x, y] = tileset.tileToWorld(q, r-Math.floor(q/2));
            drawHexagon(ctx, x, y, radius);
          }
        }
      } else {
        for (let x = 0; x < (W/tileset.tilewidth)-1; x++) {
          for (let y = 0; y < (H/tileset.tileheight)-1; y++) {
            drawRect(ctx, x*tileset.tilewidth, y*tileset.tileheight, tileset.tilewidth, tileset.tileheight);
          }
        }
      }
    }
    layers.forEach(layer => {
      if (!layer.visible) return;
      Object.entries(layer.tiles).sort((a, b): number => {
        const [x1, y1] = a[0].split(',').map(v => parseInt(v));
        const [x2, y2] = b[0].split(',').map(v => parseInt(v));
        if (y1 === y2) return x1-x2;
        return y1-y2;
      }).forEach(entry => {
        const [x, y] = entry[0].split(',').map(v => parseInt(v));
        const tile = entry[1];
        drawTile(ctx, x, y, tile.tileset, tile.tileX, tile.tileY);
      });
    });
    if (tileset && tileset.loaded() && hoverX !== undefined && hoverY !== undefined) {
      drawTile(ctx, hoverX, hoverY, tileset, selectedTileX, selectedTileY);
    }
    if (!tileset || !tileset.loaded()) {
      console.log('no tileset');
    }
  }

  function onClick(e: MouseEvent) {
    if (!tileset || !tileset.img) return;
    const [q, r] = screenToTile(e.offsetX, e.offsetY);
    layers[selectedLayerIndex].tiles[`${q},${r}`] = {
      tileset: tileset,
      tileX: selectedTileX,
      tileY: selectedTileY,
    };
    draw();
  }

  function onMouseMove(e: MouseEvent) {
    [hoverX, hoverY] = screenToTile(e.offsetX, e.offsetY);
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
    if (!tileset) return;
    if (!mouseOver) return;
    switch (e.key) {
      case "ArrowLeft":
        offsetX += zoom*tileset.offsetWidth();
        e.preventDefault();
        break;
      case "ArrowRight":
        offsetX -= zoom*tileset.offsetWidth();
        e.preventDefault();
        break;
      case "ArrowUp":
        offsetY += zoom*tileset.offsetHeight();
        e.preventDefault();
        break;
      case "ArrowDown":
        offsetY -= zoom*tileset.offsetHeight();
        e.preventDefault();
        break;
    }
    requestAnimationFrame(draw);
  }

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    PNGWithMetadata.fromFile(file).then(png => {
      const tilesetPNG = PNGWithMetadata.fromDataURL(png.metadata.tileset);
      tileset = new Tileset(tilesetPNG.metadata);
      tileset.img = document.createElement('img');
      tileset.img.src = tilesetPNG.dataURL();
      layers = png.metadata.layers;
      layers.forEach(layer => {
        Object.values(layer.tiles).forEach(tile => {
          if (tileset) {
            tile.tileset = tileset;
          }
        });
      });
      name = png.metadata.name;
    });
  }

  function onSave() {
    const metadata: any = {
      layers: layers,
    };
    if (tileset && tileset.img) {
      const tilesetPNG = new PNGWithMetadata(tileset.name, tileset.metadata(), tileset.img);
      tilesetPNG.metadata.name = tileset.name;
      metadata.tileset = tilesetPNG.dataURL();
      metadata.name = name;
    }
    const png = new PNGWithMetadata(name, metadata, canvas);
    png.download();
  }

  function setLayerName(i: number) {
    return (e: Event & { currentTarget: HTMLInputElement }) => {
      if (e.currentTarget === null) return;
      layers[i].name = e.currentTarget.value;
    }
  }

  function removeLayer(i: number) {
    return () => {
      layers.splice(i, 1);
      layers = layers;
      requestAnimationFrame(draw);
    }
  }

  function selectLayer(i: number) {
    return () => {
      selectedLayerIndex = i;
    }
  }

  function toggleLayerVisibility(i: number) {
    return () => {
      layers[i].visible = !layers[i].visible;
      layers = layers;
      requestAnimationFrame(draw);
    }
  }

  function addLayer() {
    layers.push({
      name: `Layer ${layers.length+1}`,
      visible: true,
      tiles: {},
    });
    layers = layers;
  }
</script>

<div style="display: flex; flex-direction: column; flex-grow: 1;">
  <div style="display: flex; gap: 8px;">
    <label>
      <input type="checkbox" bind:checked={grid} />
      Grid
    </label>
    <span>{hoverX}, {hoverY}</span>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="name">Name</label>
      <input
        name="name"
        type="text"
        bind:value={name}
      />
    </div>
    <button on:click={onSave}>
        <Icon name="saveFloppyDisk" />
    </button>
    <input
      type="file"
      accept="image/png"
      on:change={onLoad} />
  </div>
  <div style="display: flex; flex-grow: 1;">
    <div class="canvas">
      <canvas
        style="position: absolute;"
        tabindex="1"
        bind:this={canvas}
        on:wheel={onWheel}
        on:mousemove={onMouseMove}
        on:click={onClick}
        on:keydown={onKeyDown}
        on:mouseenter={() => { canvas.focus(); mouseOver = true; }}
        on:mouseleave={() => { mouseOver = false; }}
      />
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <button on:click={() => { editingLayers = !editingLayers }}><Icon name="editPencil" /></button>
      {#each layers as layer, i}
        <div>
          {#if editingLayers}
            <input placeholder={layer.name} value={layer.name} on:change={setLayerName(i)}/>
            <button on:click={removeLayer(i)}>
              <Icon name="minus" />
            </button>
          {:else}
            <button on:click={selectLayer(i)} class:selected={selectedLayerIndex === i}>{layer.name}</button>
            <button on:click={toggleLayerVisibility(i)}>
              {#if layer.visible}
                <Icon name="eyeEmpty" />
              {:else}
                <Icon name="eyeOff" />
              {/if}
            </button>
          {/if}
        </div>
      {/each}
      <button on:click={addLayer}><Icon name="plus" /></button>
    </div>
  </div>
</div>

<style>
  .canvas {
    border: 2px solid white;
    margin: 0;
    padding: 0;
    flex-grow: 1;
  }
</style>