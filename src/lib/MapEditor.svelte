<script lang="ts" context="module">
  enum Tool {
    Select,
    Edit,
    Erase,
    Fill,
    Door,
  }
</script>

<script lang="ts">
  import Icon from "./Icon.svelte";
  import Tilemap from "./Tilemap";
  import type Tileset from "./Tileset";
  import { drawHexagon, drawRect } from "./draw";
  import Point from "./Point";

  // TODO: Select location, copy/paste layers
  export let map: Tilemap = new Tilemap();

  let canvas: HTMLCanvasElement;
  let tool: Tool = Tool.Select;
  let doorStart: Point | undefined = undefined;
  let editingLayers: boolean = false;
  let mouse: Point = new Point(-1, -1);
  let drag: Point | undefined;
  let grid: boolean = true;
  let zoom: number = 1;
  let mouseOver: boolean = false;
  let offset: Point = new Point(0, 0);

  function screenToWorld(screen: Point): Point {
    return new Point(
      (screen.x - offset.x) / zoom,
      (screen.y - offset.y) / zoom,
    );
  }

  function screenToTile(screen: Point): Point {
    const world = screenToWorld(screen);
    if (!map.tileset) return new Point(0, 0);
    return map.tileset.worldToTile(world);
  }

  function setTool(_tool: Tool) {
    tool = _tool;
  }

  function drawDoor(
    ctx: CanvasRenderingContext2D,
    tileset: Tileset,
    from: Point,
    to: Point,
  ) {
    if (tileset.type === "hex") {
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FF8000";
      ctx.strokeRect(
        from.x * tileset.tilewidth,
        from.y * tileset.tileheight,
        tileset.tilewidth,
        tileset.tileheight,
      );
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
      ctx.strokeRect(
        to.x * tileset.tilewidth,
        to.y * tileset.tileheight,
        tileset.tilewidth,
        tileset.tileheight,
      );
    }
  }

  function draw() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.clearRect(0, 0, W, H);
    ctx.setTransform(zoom, 0, 0, zoom, offset.x, offset.y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ffffff77";

    const radius = map.tileset.radius();
    const horiz = (3 / 2) * radius;
    const vert = Math.sqrt(3) * radius;
    const halfVert = (1 / 2) * vert;
    const tilewidth = map.tileset.tilewidth;
    const tileheight = map.tileset.tileheight;

    if (grid && tilewidth > 0 && tileheight > 0) {
      if (map.tileset.type === "hex") {
        let zero = screenToWorld(new Point(0, 0));
        zero.x = Math.floor(zero.x / horiz);
        zero.y = Math.floor(zero.y / vert);
        const [w, h] = [
          canvas.width / horiz / zoom,
          canvas.height / vert / zoom,
        ];
        for (let x = zero.x; x <= zero.x + w; x++) {
          for (let y = zero.y; y <= zero.y + h; y++) {
            drawHexagon(ctx, x * horiz, y * vert + ((x%2===0) ? 0 : halfVert), radius);
          }
        }
      } else {
        let zero = screenToWorld(new Point(0, 0));
        zero.x = Math.floor(zero.x / tilewidth);
        zero.y = Math.floor(zero.y / tileheight);
        const [w, h] = [W / tilewidth / zoom, H / tileheight / zoom];
        for (let x = zero.x; x <= zero.x + w; x++) {
          for (let y = zero.y; y <= zero.y + h; y++) {
            drawRect(
              ctx,
              x * tilewidth,
              y * tileheight,
              tilewidth,
              tileheight,
            );
          }
        }
      }
    }
    for (let layer of map.layers) {
      if (!layer.visible) return;
      map.drawLayer(ctx, layer);
    }
    for (let [from, to] of map.tiledata.filter<Point>("door")) {
      drawDoor(ctx, map.tileset, from, to);
    }
    if (tool === Tool.Edit && mouseOver) {
      const randTile = map.tileset.randSelectedTile();
      if (randTile) {
        map.tileset.drawTile(ctx, mouse, randTile);
      }
    }
    if (tool === Tool.Door && doorStart) {
      drawDoor(ctx, map.tileset, doorStart, mouse);
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    map.selectedTiles.forEach((loc) => {
      const world = map.tileset.tileToWorld(loc);
      switch (map.tileset.type) {
        case "square":
          drawRect(ctx, world.x, world.y, tilewidth, tileheight);
          break;
        case "hex":
          drawHexagon(
            ctx,
            world.x,
            world.y,
            radius,
          );
          break;
      }
    });
  }

  function onClick(e: PointerEvent) {
    if (e.buttons === 1) {
      if (tool === Tool.Erase) {
        map.erase(mouse);
      } else if (tool === Tool.Fill) {
        map.fill(mouse);
      } else if (tool === Tool.Door && !doorStart) {
        doorStart = mouse.clone();
      } else if (tool === Tool.Door && doorStart) {
        map.setDoor(mouse, doorStart);
        doorStart = undefined;
      } else if (tool === Tool.Edit) {
        map.set(mouse);
      } else if (tool === Tool.Select && drag !== undefined) {
        map.clearSelectedTiles();
        let a = drag;
        let b = mouse;
        for (let x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) {
          for (let y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) {
            map.addSelectedTile(new Point(x, y));
          }
        }
      } else if (tool === Tool.Select) {
        if (e.shiftKey) {
          map.toggleSelectedTile(mouse);
        } else {
          map.setSelectedTile(mouse);
        }
      }
      map = map;
    } else if (e.ctrlKey) {
      offset.x += e.movementX;
      offset.y += e.movementY;
    }
  }

  function onPointerDown(e: PointerEvent) {
    mouse = screenToTile(new Point(e.offsetX, e.offsetY));
    if (e.buttons === 1) {
      map.undoer.begin();
    }
    onClick(e);
  }

  function onPointerUp() {
    drag = undefined;
    map.undoer.end();
    map = map;
  }

  function onPointerCancel() {
    onPointerUp();
  }

  function onPointerMove(e: PointerEvent) {
    if (!map.tileset || !map.tileset.img) return;
    mouse = screenToTile(new Point(e.offsetX, e.offsetY));
    if (e.buttons === 1 && drag === undefined) {
      drag = mouse.clone();
    }
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
    offset.x = (-zoom * (e.offsetX - offset.x)) / prevZoom + e.offsetX;
    offset.y = (-zoom * (e.offsetY - offset.y)) / prevZoom + e.offsetY;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!map.tileset) return;
    if (!mouseOver) return;
    switch (true) {
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
        offset.x += zoom * map.tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowRight":
        offset.x -= zoom * map.tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowUp":
        offset.y += zoom * map.tileset.offsetHeight();
        e.preventDefault();
        break;
      case e.key === "ArrowDown":
        offset.y -= zoom * map.tileset.offsetHeight();
        e.preventDefault();
        break;
      case e.key === "Backspace" || e.key === "Delete":
        map.clear();
        map = map;
        e.preventDefault();
        break;
      case e.key === "Escape":
        map.clearSelectedTiles();
        map = map;
        e.preventDefault();
        break;
    }
  }

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    Tilemap.from(file).then((_map) => {
      map = _map;
    });
  }

  function triggerRedraw(..._args: any[]) {
    if (map.tileset && map.tileset.img) {
      requestAnimationFrame(draw);
    }
  }

  $: triggerRedraw(map, grid, zoom, offset, drag, mouse, mouseOver);
</script>

<div style="display: flex; flex-direction: column; flex-grow: 1;">
  <div style="display: flex; gap: 8px;">
    <label>
      <input type="checkbox" bind:checked={grid} />
      Grid
    </label>
    <button
      on:click={() => setTool(Tool.Select)}
      class:active={tool === Tool.Select}
    >
      <Icon name="openSelectHandGesture" />
    </button>
    <button
      on:click={() => setTool(Tool.Edit)}
      class:active={tool === Tool.Edit}
    >
      <Icon name="editPencil" />
    </button>
    <button
      on:click={() => setTool(Tool.Erase)}
      class:active={tool === Tool.Erase}
    >
      <Icon name="erase" />
    </button>
    <button
      on:click={() => setTool(Tool.Fill)}
      class:active={tool === Tool.Fill}
    >
      <Icon name="fillColor" />
    </button>
    <button
      on:click={() => setTool(Tool.Door)}
      class:active={tool === Tool.Door}
    >
      <Icon name="door" />
    </button>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="name">Name</label>
      <input name="name" type="text" bind:value={map.name} />
    </div>
    <button
      on:click={() => {
        map.undo();
        map = map;
      }}
      disabled={map.undoer.undoStack.length === 0}
    >
      <Icon name="undo" />
    </button>
    <button
      on:click={() => {
        map.redo();
        map = map;
      }}
      disabled={map.undoer.redoStack.length === 0}
    >
      <Icon name="redo" />
    </button>
    <button on:click={() => map.download()}>
      <Icon name="saveFloppyDisk" />
    </button>
    <input type="file" accept="image/png" on:change={onLoad} />
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
        on:pointerenter={() => {
          canvas.focus();
          mouseOver = true;
        }}
        on:pointerleave={() => {
          mouseOver = false;
        }}
      />
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <button
        on:click={() => {
          editingLayers = !editingLayers;
        }}><Icon name="editPencil" /></button
      >
      {#each map.layers as layer, i}
        <div>
          {#if editingLayers}
            <input
              placeholder={layer.name}
              value={layer.name}
              on:change={(e) => {
                map.layers[i].name = e.currentTarget.value;
                map = map;
              }}
            />
            <button
              on:click={() => {
                map.removeLayer(i);
                map = map;
              }}
            >
              <Icon name="minus" />
            </button>
          {:else}
            <button
              on:click={() => {
                map.selectedLayer = i;
                map = map;
              }}
              class:selected={map.selectedLayer === i}>{layer.name}</button
            >
            <button
              on:click={() => {
                map.layers[i].visible = !map.layers[i].visible;
                map = map;
              }}
            >
              {#if layer.visible}
                <Icon name="eyeEmpty" />
              {:else}
                <Icon name="eyeOff" />
              {/if}
            </button>
          {/if}
        </div>
      {/each}
      <button
        on:click={() => {
          map.addLayer();
          map = map;
        }}><Icon name="plus" /></button
      >
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
