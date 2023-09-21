<script lang="ts">
  import Icon from "./Icon.svelte";
  import { readFileAsBinaryString } from "./files";

  export let selectedTileset: HTMLImageElement;
  export let tileWidth: number, tileHeight: number;
  export let selectedTileX: number, selectedTileY: number;

  interface Tile {
    img: HTMLImageElement
    tileset?: string
    tileX: number
    tileY: number
  }

  interface Layer {
    name: string
    visible: boolean
    tiles: { [key: string]: Tile },
  }

  let canvas: HTMLCanvasElement;
  let layers: Layer[] = [{
    name: "Layer 1",
    visible: true,
    tiles: {},
  }];
  let editingLayers: boolean = false;
  let selectedLayerIndex: number = 0;
  let currQ: number, currR: number;
  let grid: boolean = true;
  let hex: boolean = true;
  let zoom: number = 1;
  let mouseOver: boolean = false;

  const DATA_JSON = "data:application/json;base64,";

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

  function screenToTile(x: number, y: number): number[] {
    const [tx, ty] = screenToWorld(x, y);
    if (hex) {
      return round_axial(((2/3)*tx) / size, ((-1/3)*tx + sqrt3/3*ty)/size);
    }
    return [Math.floor(tx/tileWidth), Math.floor(ty/tileHeight)];
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

  function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.beginPath();
    ctx.lineTo(x, y);
    ctx.lineTo(x+width, y);
    ctx.lineTo(x+width, y+height);
    ctx.lineTo(x, y+height);
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

  function drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, tileset: HTMLImageElement, tileX: number, tileY: number) {
    ctx.drawImage(
      tileset,
      tileX*tileWidth, tileY*tileHeight,
      tileWidth, tileHeight,
      x*tileWidth, y*tileHeight,
      tileWidth, tileHeight);
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
    if (grid) {
      if (hex) {
        for (let q = 0; q < (W/horiz)-1; q++) {
          for (let r = 0; r < (H/vert)-1; r++) {
            const [x, y] = hexToWorld(q, r-Math.floor(q/2));
            drawHexagon(ctx, x, y, size);
          }
        }
      } else {
        for (let x = 0; x < (W/tileWidth)-1; x++) {
          for (let y = 0; y < (H/tileHeight)-1; y++) {
            drawRect(ctx, x*tileWidth, y*tileHeight, tileWidth, tileHeight);
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
        if (tile.img && tile.img.complete) {
          if (hex) {
            drawHexTile(ctx, x, y, tile.img, tile.tileX, tile.tileY);
          } else {
            drawTile(ctx, x, y, tile.img, tile.tileX, tile.tileY);
          }
        }
      });
    });
    if (selectedTileset && selectedTileset.complete && currQ !== undefined && currR !== undefined) {
      if (hex) {
        drawHexTile(ctx, currQ, currR, selectedTileset, selectedTileX, selectedTileY);
      } else {
        drawTile(ctx, currQ, currR, selectedTileset, selectedTileX, selectedTileY);
      }
    }
  }

  function onClick(e: MouseEvent) {
    const [q, r] = screenToTile(e.offsetX, e.offsetY);
    layers[selectedLayerIndex].tiles[`${q},${r}`] = {
      img: selectedTileset,
      tileX: selectedTileX,
      tileY: selectedTileY,
    };
    draw();
  }

  function onMouseMove(e: MouseEvent) {
    [currQ, currR] = screenToTile(e.offsetX, e.offsetY);
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

  function onFileChanged(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    readFileAsBinaryString(file).then(value => {
      console.log(JSON.parse(value));
    });
  }

  function onSave() {
    /* TODO
    const a = document.createElement('a');
    a.href = DATA_JSON + btoa(JSON.stringify(tiles));
    a.download = 'map.json';
    a.click();
    */
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
    <label>
      <input type="checkbox" bind:checked={hex} />
      Hex
    </label>
    <span>{currQ}, {currR}</span>
    <button on:click={onSave}>
        <Icon name="saveFloppyDisk" />
    </button>
    <input
      type="file"
      accept="application/json"
      on:change={onFileChanged} />
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