<script lang="ts" context="module">
  enum Tool {
    Select,
    Edit,
    Erase,
    Fill,
    Door,
    MagicWand,
  }
</script>

<script lang="ts">
  import Icon from "./Icon.svelte";
  import Tilemap from "./Tilemap";
  import { drawMap } from "./draw";
  import Point from "./Point";
  import TiledataEditor from "./TiledataEditor.svelte";
  import { Camera } from "./Camera";
  import type LocalStorage from "./LocalStorage";

  // TODO: Copy/paste layers
  export let map: Tilemap = new Tilemap();
  export let camera: Camera = new Camera();
  export let storage: LocalStorage | undefined = undefined;
  if (storage) {
    const saved = storage.get();
    if (saved) {
      Tilemap.from(saved).then((_map) => {
        map = _map;
      });
    }
  }

  let canvas: HTMLCanvasElement;
  let tool: Tool = Tool.Select;
  let doorStart: Point | undefined = undefined;
  let editingLayers: boolean = false;
  let mouse: Point = new Point(-1, -1);
  let drag: Point | undefined;
  let grid: boolean = true;
  let walls: boolean = false;
  let doors: boolean = true;
  let water: boolean = false;
  let random: boolean = true;
  let mouseOver: boolean = false;

  function setTool(_tool: Tool) {
    tool = _tool;
  }

  function draw() {
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawMap(
      ctx,
      map,
      camera,
      grid,
      walls,
      doors,
      water,
      random,
      true,
      tool === Tool.Edit ? mouse : undefined,
      tool === Tool.Door && doorStart
        ? { from: doorStart, to: mouse }
        : undefined,
      tool === Tool.MagicWand && map.selectedTiles.length > 0,
    );
  }

  function onPointerDown(e: PointerEvent) {
    mouse = camera.screenToTile(new Point(e.offsetX, e.offsetY), map.tileset);
    drag = mouse.clone();
    if (e.buttons === 1) {
      if (tool === Tool.Erase) {
        map.undoer.begin();
        map.erase(mouse);
      } else if (tool === Tool.Fill) {
        map.fill(mouse);
      } else if (tool === Tool.Door && !doorStart) {
        doorStart = mouse.clone();
      } else if (tool === Tool.Door && doorStart) {
        map.setDoor(mouse, doorStart);
        doorStart = undefined;
      } else if (tool === Tool.Edit && random) {
        map.undoer.begin();
        map.setFromRandom(mouse);
      } else if (tool === Tool.Edit && !random) {
        map.undoer.begin();
        map.setFromSelection(mouse);
      } else if (tool === Tool.Select) {
        if (e.shiftKey) {
          map.toggleSelectedTile(mouse);
        } else {
          map.setSelectedTile(mouse);
        }
      }
      map = map;
    }
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
    mouse = camera.screenToTile(new Point(e.offsetX, e.offsetY), map.tileset);
    if (e.buttons === 1) {
      if (tool === Tool.Erase) {
        map.erase(mouse);
      } else if (tool === Tool.Edit && random) {
        map.setFromRandom(mouse);
      } else if (tool === Tool.Select && drag !== undefined) {
        map.clearSelectedTiles();
        let a = drag;
        let b = mouse;
        for (let x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) {
          for (let y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) {
            map.addSelectedTile(new Point(x, y));
          }
        }
      }
      map = map;
    } else if (e.ctrlKey) {
      camera.offset.x += e.movementX;
      camera.offset.y += e.movementY;
    }
  }

  function onWheel(e: WheelEvent) {
    if (e.deltaY < 0) {
      camera.zoomTo(0.1, new Point(e.offsetX, e.offsetY));
    } else if (e.deltaY > 0) {
      camera.zoomTo(-0.1, new Point(e.offsetX, e.offsetY));
    }
    camera = camera;
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
        camera.offset.x += camera.zoom * map.tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowRight":
        camera.offset.x -= camera.zoom * map.tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowUp":
        camera.offset.y += camera.zoom * map.tileset.offsetHeight();
        e.preventDefault();
        break;
      case e.key === "ArrowDown":
        camera.offset.y -= camera.zoom * map.tileset.offsetHeight();
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

  $: triggerRedraw(
    map,
    grid,
    walls,
    doors,
    water,
    camera,
    drag,
    mouse,
    mouseOver,
  );
</script>

<div style="display: flex; flex-direction: column; flex-grow: 1;">
  <div style="display: flex; gap: 8px;">
    <button on:click={() => storage && storage.clear()}>
      <Icon name="emptyPage" />
    </button>
    <label>
      <input type="checkbox" bind:checked={grid} />
      Grid
    </label>
    <label>
      <input type="checkbox" bind:checked={walls} />
      Walls
    </label>
    <label>
      <input type="checkbox" bind:checked={doors} />
      Doors
    </label>
    <label>
      <input type="checkbox" bind:checked={water} />
      Water
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
    <button on:click={() => (random = !random)} class:active={random}>
      <Icon name="diceFive" />
    </button>
    <button
      on:click={() => setTool(Tool.MagicWand)}
      class:active={tool === Tool.MagicWand}
    >
      <Icon name="magicWand" />
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
            <div style="display: flex; flex-direction: row;">
              <button
                on:click={() => {
                  map.removeLayer(i);
                  map = map;
                }}
              >
                <Icon name="minus" />
              </button>
              {#if i >= 1}
                <button
                  on:click={() => {
                    const tmp = map.layers[i - 1];
                    map.layers[i - 1] = map.layers[i];
                    map.layers[i] = tmp;
                    map = map;
                  }}
                >
                  <Icon name="arrowUp" />
                </button>
              {/if}
              {#if i + 1 < map.layers.length}
                <button
                  on:click={() => {
                    const tmp = map.layers[i + 1];
                    map.layers[i + 1] = map.layers[i];
                    map.layers[i] = tmp;
                    map = map;
                  }}
                >
                  <Icon name="arrowDown" />
                </button>
              {/if}
            </div>
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
      {#if map && map.selectedTiles.length === 1}
        <TiledataEditor bind:map />
      {/if}
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
