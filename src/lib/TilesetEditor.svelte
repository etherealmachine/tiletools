<script lang="ts" context="module">
  enum Tool {
    Select,
    Edit,
    Fill,
    Erase,
    Move,
  }
</script>

<script lang="ts">
  import { browser } from "$app/environment";

  import Icon from "./Icon.svelte";
  import Tileset from "./Tileset";
  import { drawHexagon, drawRect } from "./draw";
  import Point from "./Point";
  import { Camera } from "./Camera";
  import type LocalStorage from "./LocalStorage";

  export let tileset: Tileset = new Tileset();
  export let maxWidth: string | undefined = undefined;
  export let storage: LocalStorage | undefined = undefined;
  if (storage) {
    const saved = storage.get();
    if (saved) {
      Tileset.from(saved).then((_tileset) => {
        tileset = _tileset;
      });
    }
  }

  let canvas: HTMLCanvasElement | undefined;
  let camera: Camera = new Camera();
  let mouseOver: boolean = false;
  let mouseDown: boolean = false;
  let mouse: Point = new Point(-1, -1);
  let drag: Point | undefined;
  let tagString: string = "";
  let tagInput: HTMLInputElement | undefined;
  let filter: string = "";
  let tool: Tool = Tool.Select;
  let color: string = "#ffffff";
  let alpha: number = 255;
  let degrees: number = 90;

  function draw() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    camera.setup(ctx);

    if (tileset.tiles.length > 0) {
      for (let i = 0; i < tileset.tiles.length; i++) {
        const tile = tileset.tiles[i];
        if (!tile.img) continue;
        const dest = tileset.tileToImgCoords(tile.loc);
        const source = camera.worldToScreen(dest);
        if (
          source.x < -tileset.tilewidth * camera.zoom ||
          source.y < -tileset.tileheight * camera.zoom ||
          source.x > W ||
          source.y > H
        )
          continue;
        if (
          filter === "" ||
          tileset.tiledata
            .get<string[]>(tile.loc, "tags")
            ?.some((tag) => tag.startsWith(filter))
        ) {
          ctx.drawImage(
            tile.img,
            0,
            0,
            tileset.tilewidth,
            tileset.tileheight,
            dest.x,
            dest.y,
            tileset.tilewidth,
            tileset.tileheight,
          );
        }
      }
    } else if (tileset.img) {
      ctx.drawImage(tileset.img, 0, 0);
    } else {
      triggerRedraw();
      return;
    }

    ctx.lineWidth = 1 / camera.zoom;
    if (mouseOver) {
      if (tool === Tool.Select) {
        const p = tileset.tileToImgCoords(tileset.imgCoordsToTile(mouse));
        ctx.strokeStyle = "#000";
        drawRect(ctx, p.x, p.y, tileset.tilewidth, tileset.tileheight);
      } else if (tool === Tool.Edit || tool === Tool.Erase) {
        ctx.fillStyle = color;
        if (tool === Tool.Erase) {
          ctx.fillStyle = "white";
        }
        ctx.fillRect(Math.floor(mouse.x), Math.floor(mouse.y), 1, 1);
      }
    }
    ctx.strokeStyle = "#000";
    tileset.selectedTiles.forEach((loc) => {
      const p = tileset.tileToImgCoords(loc);
      drawRect(ctx, p.x, p.y, tileset.tilewidth, tileset.tileheight);
      if (
        (tool === Tool.Edit || tool === Tool.Erase || tool === Tool.Move) &&
        tileset.type === "hex"
      ) {
        const r = tileset.radius();
        drawHexagon(
          ctx,
          p.x + 0.5 * tileset.tilewidth,
          p.y + tileset.tileheight - r,
          r,
        );
      }
    });

    if (tileset.rendering) {
      triggerRedraw();
    }
  }

  function onWheel(e: WheelEvent) {
    // TODO: Move zoom to into Camera
    const prevZoom = camera.zoom;
    if (e.deltaY < 0) {
      camera.zoom *= 1.1;
    } else if (e.deltaY > 0) {
      camera.zoom *= 0.9;
    }
    camera.zoom = Math.min(Math.max(0.05, camera.zoom), 16);
    camera.offset.x =
      (-camera.zoom * (e.offsetX - camera.offset.x)) / prevZoom + e.offsetX;
    camera.offset.y =
      (-camera.zoom * (e.offsetY - camera.offset.y)) / prevZoom + e.offsetY;
  }

  function parseColor(color: string): number[] | undefined {
    if (color.startsWith("#")) {
      const match = color.match(/^#(\w{2})(\w{2})(\w{2})(\w{2})?$/);
      if (!match) return undefined;
      return [
        parseInt(match[1], 16),
        parseInt(match[2], 16),
        parseInt(match[3], 16),
        parseInt(match[4], 16) || 255,
      ];
    } else if (color.startsWith("rgb")) {
      const match = color.match(
        /^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(0\.\d+)?\)$/,
      );
      if (!match) return undefined;
      return [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
        Math.round(parseFloat(match[4]) * 255) || 255,
      ];
    }
    return undefined;
  }

  function rgbaToHex(rgba: number[]): string {
    const [r, g, b, a] = rgba;
    function hex(x: number) {
      if (isNaN(x)) return "";
      return ("0" + x.toString(16)).slice(-2);
    }
    return "#" + hex(r) + hex(g) + hex(b) + hex(a);
  }

  function setColor(e: Event) {
    let colorString: string;
    if (e.target instanceof HTMLButtonElement) {
      colorString = (e.target as HTMLButtonElement).style.backgroundColor;
    } else if (e.target instanceof HTMLInputElement) {
      colorString = (e.target as HTMLInputElement).value;
    } else {
      return;
    }
    const rgba = parseColor(colorString);
    if (!rgba) return;
    color = rgbaToHex(rgba);
    alpha = rgba[3];
    if (tool !== Tool.Edit && tool !== Tool.Fill) {
      setTool(Tool.Edit);
    }
  }

  function onPointerDown(e: PointerEvent) {
    mouse = camera.screenToWorld(new Point(e.offsetX, e.offsetY));
    drag = mouse.clone();
    mouseDown = true;
    if (tool === Tool.Edit) {
      tileset.undoer.begin();
      tileset.setPixel(mouse.floor(), {
        r: parseInt(color.slice(1, 3), 16),
        g: parseInt(color.slice(3, 5), 16),
        b: parseInt(color.slice(5, 7), 16),
        a: Math.round(alpha),
      });
      tileset = tileset;
    } else if (tool === Tool.Fill) {
      tileset.fill(mouse.floor(), {
        r: parseInt(color.slice(1, 3), 16),
        g: parseInt(color.slice(3, 5), 16),
        b: parseInt(color.slice(5, 7), 16),
        a: Math.round(alpha),
      });
    } else if (tool === Tool.Erase) {
      tileset.undoer.begin();
      tileset.setPixel(mouse.floor(), { r: 0, g: 0, b: 0, a: 0 });
      tileset = tileset;
    } else if (tool === Tool.Select) {
      const world = camera.screenToWorld(new Point(e.offsetX, e.offsetY));
      if (!tileset.img) return;
      if (
        world.x < 0 ||
        world.x >= tileset.img.width ||
        world.y < 0 ||
        world.y >= tileset.img.height
      ) {
        return;
      }
      const tile = tileset.imgCoordsToTile(world);
      if (e.shiftKey) {
        tileset.toggleSelectedTile(tile);
      } else {
        tileset.setSelectedTile(tile);
        if (tagInput) {
          tagInput.focus();
        }
      }
      tagString = Array.from(tileset.selectionTags().values()).join(",");
      tileset = tileset;
    }
  }

  function onPointerMove(e: PointerEvent) {
    mouse = camera.screenToWorld(new Point(e.offsetX, e.offsetY));
    if (mouseDown) {
      if (tool === Tool.Edit) {
        tileset.setPixel(mouse.floor(), {
          r: parseInt(color.slice(1, 3), 16),
          g: parseInt(color.slice(3, 5), 16),
          b: parseInt(color.slice(5, 7), 16),
          a: Math.round(alpha),
        });
        tileset = tileset;
      } else if (tool === Tool.Erase) {
        tileset.setPixel(mouse.floor(), { r: 0, g: 0, b: 0, a: 0 });
        tileset = tileset;
      } else if (tool === Tool.Select && drag !== undefined) {
        tileset.clearSelectedTiles();
        let a = tileset.imgCoordsToTile(drag);
        let b = tileset.imgCoordsToTile(mouse);
        for (let x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) {
          for (let y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) {
            tileset.toggleSelectedTile(new Point(x, y));
          }
        }
        tileset = tileset;
      }
    } else if (e.ctrlKey) {
      camera.offset.x += e.movementX;
      camera.offset.y += e.movementY;
    }
  }

  function onPointerUp() {
    mouseDown = false;
    drag = undefined;
    tileset.undoer.end();
    tileset = tileset;
  }

  function onPointerCancel(e: PointerEvent) {
    onPointerUp();
  }

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    if (!file) return;
    Tileset.from(file).then((_tileset) => {
      tileset = _tileset;
      camera = new Camera();
      camera.zoom = 2;
    });
  }

  function onTagsChanged(e: Event) {
    const tags = new Set((e.target as HTMLInputElement).value.split(","));
    tileset.setSelectionTags(tags);
    tagString = Array.from(tileset.selectionTags().values()).join(",");
  }

  function setTool(_tool: Tool) {
    tool = _tool;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!mouseOver) return;
    switch (true) {
      case e.key === "s":
        setTool(Tool.Select);
        e.preventDefault();
        break;
      case e.key === "e":
        setTool(Tool.Erase);
        e.preventDefault();
        break;
      case e.key === "d":
        setTool(Tool.Edit);
        e.preventDefault();
        break;
      case e.key === "m":
        setTool(Tool.Move);
        e.preventDefault();
        break;
      case e.key === "z" && e.ctrlKey:
        tileset.undo();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "y" && e.ctrlKey:
        tileset.redo();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "s" && e.ctrlKey:
        tileset.download();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "x" && e.ctrlKey:
        tileset.cut();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "c" && e.ctrlKey:
        tileset.copy();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "v" && e.ctrlKey:
        tileset.paste();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "Backspace" || e.key === "Delete":
        tileset.clear();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "z" && tileset.selectedTiles.length === 1:
        const [w, h] = [canvas?.width || 0, canvas?.height || 0];
        const maxZoom =
          Math.min(w, h) / Math.max(tileset.tilewidth, tileset.tileheight);
        const p = tileset.tileToImgCoords(tileset.selectedTiles[0]);
        camera.zoom = maxZoom;
        const centerX = w / 2 - (tileset.tilewidth * camera.zoom) / 2;
        camera.offset.x = -p.x * camera.zoom + centerX;
        camera.offset.y = -p.y * camera.zoom;
        e.preventDefault();
        break;
      case e.key === "i" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0].add(new Point(0, -1)));
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "k" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0].add(new Point(0, 1)));
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "j" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0].add(new Point(-1, 0)));
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "l" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0].add(new Point(1, 0)));
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "ArrowLeft" && tool === Tool.Move:
        tileset.move(-1, 0);
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "ArrowRight" && tool === Tool.Move:
        tileset.move(1, 0);
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "ArrowUp" && tool === Tool.Move:
        tileset.move(0, -1);
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "ArrowDown" && tool === Tool.Move:
        tileset.move(0, 1);
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "ArrowLeft":
        if (e.shiftKey) {
          camera.offset.x += camera.zoom;
        } else {
          camera.offset.x += camera.zoom * tileset.offsetWidth();
        }
        e.preventDefault();
        break;
      case e.key === "ArrowRight":
        if (e.shiftKey) {
          camera.offset.x -= camera.zoom;
        } else {
          camera.offset.x -= camera.zoom * tileset.offsetWidth();
        }
        e.preventDefault();
        break;
      case e.key === "ArrowUp":
        if (e.shiftKey) {
          camera.offset.y += camera.zoom;
        } else {
          camera.offset.y += camera.zoom * tileset.offsetHeight();
        }
        e.preventDefault();
        break;
      case e.key === "ArrowDown":
        if (e.shiftKey) {
          camera.offset.y -= camera.zoom;
        } else {
          camera.offset.y -= camera.zoom * tileset.offsetHeight();
        }
        e.preventDefault();
        break;
      case e.key === "Escape":
        tileset.clearSelectedTiles();
        tileset = tileset;
        e.preventDefault();
        break;
    }
  }

  function triggerRedraw(..._args: any[]) {
    if (tileset && browser) {
      requestAnimationFrame(draw);
    }
  }

  $: triggerRedraw(
    tileset,
    color,
    alpha,
    tool,
    camera,
    filter,
    mouse,
    mouseOver,
  );
</script>

<svelte:window on:keydown={onKeyDown} />
<div
  style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;"
  style:max-width={maxWidth}
>
  <div style="display: flex; gap: 8px; align-items: end; flex-wrap: wrap;">
    <button on:click={() => storage && storage.clear()}>
      <Icon name="emptyPage" />
    </button>
    <input type="file" accept="image/png" on:change={onLoad} />
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="name">Name</label>
      <input name="name" type="text" bind:value={tileset.name} />
    </div>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="width">Width</label>
      <input
        name="width"
        type="number"
        bind:value={tileset.tilewidth}
        min="1"
        max="64"
        style="max-width: 4em;"
      />
    </div>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="height">Height</label>
      <input
        name="height"
        type="number"
        bind:value={tileset.tileheight}
        min="1"
        max="64"
        style="max-width: 4em;"
      />
    </div>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="margin">Margin</label>
      <input
        name="margin"
        type="number"
        bind:value={tileset.margin}
        min="1"
        max="64"
        style="max-width: 4em;"
      />
    </div>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="spacing">Spacing</label>
      <input
        name="spacing"
        type="number"
        bind:value={tileset.spacing}
        min="1"
        max="64"
        style="max-width: 4em;"
      />
    </div>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="type">Type</label>
      <select name="type" bind:value={tileset.type}>
        <option value="square">Square</option>
        <option value="hex">Hex</option>
      </select>
    </div>
    <button on:click={() => tileset.createTiles()} disabled={!tileset.img}>
      <Icon name="refresh" />
    </button>
    <div style="margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap;">
      <button
        on:click={() => setTool(Tool.Select)}
        class:active={tool === Tool.Select}
      >
        <Icon name="openSelectHandGesture" />
      </button>
      <button
        on:click={() => setTool(Tool.Edit)}
        class:active={tool === Tool.Edit}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="editPencil" />
      </button>
      <button
        on:click={() => setTool(Tool.Fill)}
        class:active={tool === Tool.Fill}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="fillColor" />
      </button>
      <button
        on:click={() => setTool(Tool.Erase)}
        class:active={tool === Tool.Erase}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="erase" />
      </button>
      <button
        on:click={() => setTool(Tool.Move)}
        class:active={tool === Tool.Move}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="drag" />
      </button>
      <button
        on:click={() => {
          tileset.flip("y");
          tileset = tileset;
        }}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="flipHoriz" />
      </button>
      <button
        on:click={() => {
          tileset.flip("x");
          tileset = tileset;
        }}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="flipVert" />
      </button>
      <button
        on:click={() => {
          tileset.rotate(degrees);
          tileset = tileset;
        }}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="cropRotateTl" />
        <input
          type="number"
          min="0"
          max="90"
          bind:value={degrees}
          on:click={(e) => e.stopPropagation()}
          disabled={tileset.selectedTiles.length !== 1}
        />
      </button>
      <button
        on:click={() => {
          tileset.undo();
          tileset = tileset;
        }}
        disabled={tileset.undoer.undoStack.length === 0}
      >
        <Icon name="undo" />
      </button>
      <button
        on:click={() => {
          tileset.redo();
          tileset = tileset;
        }}
        disabled={tileset.undoer.redoStack.length === 0}
      >
        <Icon name="redo" />
      </button>
      <button
        on:click={() => {
          tileset.clear();
          tileset = tileset;
        }}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="deleteCircle" />
      </button>
      <button
        on:click={() => {
          tileset.cut();
          tileset = tileset;
        }}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="cut" />
      </button>
      <button
        on:click={() => {
          tileset.copy();
          tileset = tileset;
        }}
        disabled={!tileset.selectedTiles.length}
      >
        <Icon name="copy" />
      </button>
      <button
        on:click={() => {
          tileset.paste();
          tileset = tileset;
        }}
        disabled={!tileset.copyBuffer.length || !tileset.selectedTiles.length}
      >
        <Icon name="pasteClipboard" />
      </button>
      <button disabled={!tileset.img} on:click={() => tileset.download()}>
        <Icon name="saveFloppyDisk" />
      </button>
    </div>
  </div>
  <div style="display: flex; gap: 8px; align-items: end;">
    <input name="filter" type="text" placeholder="Filter" bind:value={filter} />
  </div>
  <div class="canvas">
    <canvas
      style="position: absolute;"
      bind:this={canvas}
      on:wheel={onWheel}
      on:pointerup={onPointerUp}
      on:pointerdown={onPointerDown}
      on:pointermove={onPointerMove}
      on:pointercancel={onPointerCancel}
      on:pointerenter={() => {
        if (canvas) canvas.focus();
        mouseOver = true;
      }}
      on:pointerleave={() => {
        mouseOver = false;
      }}
    />
  </div>
  <div
    style="display: flex; flex-direction: row; gap: 8px; align-items: start; flex-wrap: wrap;"
  >
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="tags">Tags</label>
      <input
        name="tags"
        type="text"
        on:change={onTagsChanged}
        bind:value={tagString}
        bind:this={tagInput}
      />
    </div>
    <input
      type="color"
      name="color"
      on:change={setColor}
      value={color.substring(0, Math.min(color.length, 7))}
    />
    <input type="range" min="0" max="255" bind:value={alpha} />
    <div
      style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 12px;"
    >
      {#each tileset.palette() as color}
        <button
          on:click={setColor}
          style:background-color={color}
          class="palette"
        />
      {/each}
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
