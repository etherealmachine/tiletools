<script lang="ts">
  import Icon from "./Icon.svelte";
  import Tilemap from "./Tilemap";
  import { drawHexagon, drawRect } from "./draw";

  // TODO: Select location, copy/paste layers
  export let map: Tilemap  = new Tilemap();

  let canvas: HTMLCanvasElement;
  let erase: boolean = false;
  let editingLayers: boolean = false;
  let mouseX: number, mouseY: number;
  let dragX: number | undefined, dragY: number | undefined;
  let grid: boolean = true;
  let zoom: number = 1;
  let mouseOver: boolean = false;
  let offsetX: number = 0, offsetY: number = 0;

  function screenToWorld(x: number, y: number): number[] {
    return [(x-offsetX)/zoom, (y-offsetY)/zoom];
  }

  function screenToTile(x: number, y: number): number[] {
    const [tx, ty] = screenToWorld(x, y);
    if (!map.tileset) return [0, 0];
    return map.tileset.worldToTile(tx, ty);
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
    if (grid && map.tileset && map.tileset.tilewidth > 0 && map.tileset.tileheight > 0) {
      if (map.tileset.type === "hex") {
        const radius = map.tileset.radius();
        const horiz = (3/2)*radius;
        const halfHoriz = (1/2)*horiz;
        const vert = Math.sqrt(3)*radius;
        const halfVert = (1/2)*vert;
        let [x1, y1] = screenToWorld(0, 0);
        x1 = Math.floor(x1/horiz);
        y1 = Math.floor(y1/vert);
        const [w, h] = [canvas.width/horiz/zoom, canvas.height/vert/zoom];
        for (let x = x1; x <= x1+w; x++) {
          for (let y = y1; y <= y1+h; y++) {
            if (x % 2 === 0) {
              drawHexagon(ctx, x*horiz, y*vert, radius);
            } else {
              drawHexagon(ctx, x*horiz, y*vert+halfVert, radius);
            }
          }
        }
      } else {
        let [x1, y1] = screenToWorld(0, 0);
        x1 = Math.floor(x1/map.tileset.tilewidth);
        y1 = Math.floor(y1/map.tileset.tileheight);
        const [w, h] = [canvas.width/map.tileset.tilewidth/zoom, canvas.height/map.tileset.tileheight/zoom];
        for (let x = x1; x <= x1+w; x++) {
          for (let y = y1; y <= y1+h; y++) {
            drawRect(ctx, x*map.tileset.tilewidth, y*map.tileset.tileheight, map.tileset.tilewidth, map.tileset.tileheight);
          }
        }
      }
    }
    if (map.tileset) {
      for (let layer of map.layers) {
        if (!layer.visible) return;
        map.drawLayer(ctx, layer);
      }
      if (mouseX !== undefined && mouseY !== undefined && mouseOver) {
        const randTile = map.tileset.randSelectedTile();
        if (randTile) {
          map.tileset.drawTile(ctx, mouseX, mouseY, randTile[0], randTile[1]);
        }
      }
    }
  }

  function onClick(e: PointerEvent) {
    if (e.buttons === 1) {
      if (e.ctrlKey || erase) {
        map.erase(mouseX, mouseY);
      } else if (e.shiftKey) {
        map.fill(mouseX, mouseY);
      } else {
        map.set(mouseX, mouseY);
      }
      map = map
    } else if (e.ctrlKey) {
      offsetX += e.movementX;
      offsetY += e.movementY;
    }
  }

  function onPointerDown(e: PointerEvent) {
    [mouseX, mouseY] = screenToTile(e.offsetX, e.offsetY);
    [dragX, dragY] = [mouseX, mouseY];
    if (e.buttons === 1) {
      map.undoer.begin();
    }
    onClick(e);
  }

  function onPointerUp(e: PointerEvent) {
    [dragX, dragY] = [undefined, undefined];
    map.undoer.end();
  }

  function onPointerCancel() {
    [dragX, dragY] = [undefined, undefined];
    map.undoer.end();
  }

  function onPointerMove(e: PointerEvent) {
    if (!map.tileset || !map.tileset.img) return;
    [mouseX, mouseY] = screenToTile(e.offsetX, e.offsetY);
    onClick(e);
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
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!map.tileset) return;
    if (!mouseOver) return;
    switch (true) {
      case e.key === "e":
        erase = true;
        e.preventDefault();
        break;
      case e.key === "z" && e.ctrlKey:
        map.undo();
        e.preventDefault();
        break;
      case e.key === "y" && e.ctrlKey:
        map.redo();
        e.preventDefault();
        break;
      case e.key === "s" && e.ctrlKey:
        map.download();
        e.preventDefault();
        break;
      case e.key === "ArrowLeft":
        offsetX += zoom*map.tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowRight":
        offsetX -= zoom*map.tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowUp":
        offsetY += zoom*map.tileset.offsetHeight();
        e.preventDefault();
        break;
      case e.key === "ArrowDown":
        offsetY -= zoom*map.tileset.offsetHeight();
        e.preventDefault();
        break;
    }
  }

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    Tilemap.loadFromFile(file).then(_map => {
      map = _map;
    })
  }

  function triggerRedraw(..._args: any[]) {
    if (map.tileset && map.tileset.img) {
      requestAnimationFrame(draw);
    }
  }

  $: triggerRedraw(
    map, grid,
    zoom, offsetX, offsetY,
    dragX, dragY,
    mouseX, mouseY, mouseOver);
</script>

<div style="display: flex; flex-direction: column; flex-grow: 1;">
  <div style="display: flex; gap: 8px;">
    <label>
      <input type="checkbox" bind:checked={grid} />
      Grid
    </label>
    <span>{mouseX}, {mouseY}</span>
    <button on:click={() => { erase = !erase}} class:active={erase}>
      <Icon name="erase" />
    </button>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="name">Name</label>
      <input
        name="name"
        type="text"
        bind:value={map.name}
      />
    </div>
    <button on:click={() => { map.undo(); map = map }}>
        <Icon name="undo" />
    </button>
    <button on:click={() => { map.redo(); map = map }}>
        <Icon name="redo" />
    </button>
    <button on:click={() => map.download()}>
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
        on:pointerdown={onPointerDown}
        on:pointerup={onPointerUp}
        on:pointercancel={onPointerCancel}
        on:pointermove={onPointerMove}
        on:keydown={onKeyDown}
        on:pointerenter={() => { canvas.focus(); mouseOver = true; }}
        on:pointerleave={() => { mouseOver = false; }}
      />
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <button on:click={() => { editingLayers = !editingLayers }}><Icon name="editPencil" /></button>
      {#each map.layers as layer, i}
        <div>
          {#if editingLayers}
            <input placeholder={layer.name} value={layer.name} on:change={(e) => { map.layers[i].name = e.currentTarget.value; map = map }} />
            <button on:click={() => { map.removeLayer(i); map = map }}>
              <Icon name="minus" />
            </button>
          {:else}
            <button on:click={() => { map.selectedLayer = i; map = map }} class:selected={map.selectedLayer === i}>{layer.name}</button>
            <button on:click={() => { map.layers[i].visible = !map.layers[i].visible; map = map }}>
              {#if layer.visible}
                <Icon name="eyeEmpty" />
              {:else}
                <Icon name="eyeOff" />
              {/if}
            </button>
          {/if}
        </div>
      {/each}
      <button on:click={() => { map.addLayer(); map = map }}><Icon name="plus" /></button>
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