<script lang="ts" context="module">
  export interface Tile {
    tileX: number
    tileY: number
  }

  export interface Layer {
    name: string
    visible: boolean
    tiles: { [key: string]: Tile },
  }
</script>

<script lang="ts">
    import { goto } from "$app/navigation";

  import Icon from "./Icon.svelte";
  import { PNGWithMetadata } from "./PNGWithMetadata";
  import Tileset from "./Tileset";
  import { drawHexagon, drawRect, drawTile } from "./draw";

  export let tileset: Tileset | undefined;
  // TODO: Select location, copy/paste layers
  export let layers: Layer[] = [{
    name: "Layer 1",
    visible: true,
    tiles: {},
  }];

  let canvas: HTMLCanvasElement;
  let name: string;
  let erase: boolean = false;
  let editingLayers: boolean = false;
  let selectedLayerIndex: number = 0;
  let mouseX: number, mouseY: number;
  let dragX: number | undefined, dragY: number | undefined;
  let grid: boolean = true;
  let zoom: number = 1;
  let mouseOver: boolean = false;
  let offsetX: number = 0, offsetY: number = 0;
  let dirty: boolean = false;
  let undoStack: Layer[][] = [];
  let redoStack: Layer[][] = [];

  function screenToWorld(x: number, y: number): number[] {
    return [(x-offsetX)/zoom, (y-offsetY)/zoom];
  }

  function screenToTile(x: number, y: number): number[] {
    const [tx, ty] = screenToWorld(x, y);
    if (!tileset) return [0, 0];
    return tileset.worldToTile(tx, ty);
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
        x1 = Math.floor(x1/tileset.tilewidth);
        y1 = Math.floor(y1/tileset.tileheight);
        const [w, h] = [canvas.width/tileset.tilewidth/zoom, canvas.height/tileset.tileheight/zoom];
        for (let x = x1; x <= x1+w; x++) {
          for (let y = y1; y <= y1+h; y++) {
            drawRect(ctx, x*tileset.tilewidth, y*tileset.tileheight, tileset.tilewidth, tileset.tileheight);
          }
        }
      }
    }
    if (tileset && tileset.loaded()) {
      const ts = tileset;
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
          drawTile(ctx, x, y, ts, tile.tileX, tile.tileY);
        });
      });
      if (mouseX !== undefined && mouseY !== undefined && mouseOver) {
        // TODO: Shift drag to preview filling area
        const randTile = tileset.randSelectedTile();
        if (randTile) {
          drawTile(ctx, mouseX, mouseY, ts, randTile[0], randTile[1]);
        }
      }
    }
  }

  function onPointerDown(e: PointerEvent) {
    [mouseX, mouseY] = screenToTile(e.offsetX, e.offsetY);
    [dragX, dragY] = [mouseX, mouseY];
  }

  function onPointerUp(e: PointerEvent) {
    [dragX, dragY] = [undefined, undefined];
  }

  function onPointerCancel() {
    [dragX, dragY] = [undefined, undefined];
  }

  function onPointerMove(e: PointerEvent) {
    if (!tileset || !tileset.img) return;
    [mouseX, mouseY] = screenToTile(e.offsetX, e.offsetY);
    if (e.buttons === 1) {
      // TODO: Shift drag to fill area
      if (!dirty) {
        pushStack(undoStack);
        dirty = true;
      }
      const loc = `${mouseX},${mouseY}`;
      if (e.ctrlKey || erase) {
        delete layers[selectedLayerIndex].tiles[loc];
      } else {
        const randTile = tileset.randSelectedTile();
        if (randTile) {
          layers[selectedLayerIndex].tiles[loc] = {
            tileX: randTile[0],
            tileY: randTile[1],
          };
        }
      }
    } else {
      dirty = false;
      if (e.ctrlKey) {
        offsetX += e.movementX;
        offsetY += e.movementY;
      }
    }
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
    if (!tileset) return;
    if (!mouseOver) return;
    switch (true) {
      case e.key === "e":
        erase = true;
        e.preventDefault();
        break;
      case e.key === "z" && e.ctrlKey:
        undo();
        e.preventDefault();
        break;
      case e.key === "y" && e.ctrlKey:
        redo();
        e.preventDefault();
        break;
      case e.key === "s" && e.ctrlKey:
        save();
        e.preventDefault();
        break;
      case e.key === "ArrowLeft":
        offsetX += zoom*tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowRight":
        offsetX -= zoom*tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowUp":
        offsetY += zoom*tileset.offsetHeight();
        e.preventDefault();
        break;
      case e.key === "ArrowDown":
        offsetY -= zoom*tileset.offsetHeight();
        e.preventDefault();
        break;
      case mouseOver && e.key === "Shift":
        // TODO: Flood fill with shift
        e.preventDefault();
        break;
    }
  }

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    PNGWithMetadata.fromFile(file).then(png => {
      const tilesetPNG = PNGWithMetadata.fromDataURL(png.metadata.tileset);
      tilesetPNG.dataURL().then(url => {
        tileset = new Tileset(tilesetPNG.metadata);
        tileset.img = document.createElement('img');
        tileset.img.src = url;
        layers = png.metadata.layers;
        name = png.metadata.name;
        pushStack(undoStack);
      });
    });
  }

  function pushStack(stack: Layer[][], clearRedo: boolean = true) {
    stack.push(JSON.parse(JSON.stringify(layers)));
    if (clearRedo) {
      redoStack = [];
    }
  }

  function undo() {
    const last = undoStack.pop();
    if (!last) return;
    pushStack(redoStack, false);
    layers = last;
  }

  function redo() {
    const last = redoStack.pop();
    if (!last) return;
    pushStack(undoStack, false);
    layers = last;
  }

  function save() {
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

  function loadScene() {
    const metadata: any = {
      layers: layers,
    };
    if (tileset && tileset.img) {
      const tilesetPNG = new PNGWithMetadata(tileset.name, tileset.metadata(), tileset.img);
      tilesetPNG.metadata.name = tileset.name;
      metadata.tileset = tilesetPNG.dataURL();
      metadata.name = name;
    }
    goto(`/scene?map=${new PNGWithMetadata(name, metadata, canvas).dataURL()}`);
  }

  function setLayerName(i: number) {
    return (e: Event & { currentTarget: HTMLInputElement }) => {
      if (e.currentTarget === null) return;
      pushStack(undoStack);
      layers[i].name = e.currentTarget.value;
    }
  }

  function removeLayer(i: number) {
    return () => {
      pushStack(undoStack);
      layers.splice(i, 1);
      layers = layers;
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
    }
  }

  function addLayer() {
    pushStack(undoStack);
    layers.push({
      name: `Layer ${layers.length+1}`,
      visible: true,
      tiles: {},
    });
    layers = layers;
  }

  function triggerRedraw(..._args: any[]) {
    if (tileset && tileset.loaded()) {
      requestAnimationFrame(draw);
    }
  }

  $: triggerRedraw(
    tileset, layers, grid,
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
        bind:value={name}
      />
    </div>
    <button on:click={undo}>
        <Icon name="undo" />
    </button>
    <button on:click={redo}>
        <Icon name="redo" />
    </button>
    <button on:click={save}>
        <Icon name="saveFloppyDisk" />
    </button>
    <button on:click={loadScene}>
        <Icon name="hexagonDice" />
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