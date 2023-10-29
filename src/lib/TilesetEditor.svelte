<script lang="ts" context="module">
  enum Tool { Select, Edit, Erase, Move };
</script>

<script lang="ts">
  import { browser } from "$app/environment";

  import Icon from "./Icon.svelte";
  import { PNGWithMetadata } from "./PNGWithMetadata";
  import Tileset from "./Tileset";
  import { drawHexagon, drawRect, drawTile } from "./draw";
  import rotsprite from "./rotsprite";

  export let tileset: Tileset = new Tileset({});
  export let maxWidth: string | undefined = undefined;

  let canvas: HTMLCanvasElement | undefined;
  let zoom: number = 2;
  let mouseOver: boolean = false;
  let mouseDown: boolean = false;
  let offsetX: number = 0, offsetY: number = 0;
  let mouseX: number | undefined, mouseY: number | undefined;
  let dragX: number | undefined, dragY: number | undefined;
  let tagString: string = "";
  let tagInput: HTMLInputElement | undefined;
  let filter: string = "";
  let tool: Tool = Tool.Select;
  let color: string = "#ffffff";
  let alpha: number = 255;
  let degrees: number = 90;

  function screenToWorld(x: number, y: number): number[] {
    return [(x-offsetX)/zoom, (y-offsetY)/zoom];
  }

  function worldToScreen(x: number, y: number): number[] {
    return [x*zoom+offsetX, y*zoom+offsetY];
  }

  function draw() {
    if (!canvas) return;
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

    if (tileset.tiles) {
      for (let i = 0; i < tileset.tiles.length; i++) {
        const tile = tileset.tiles[i];
        if (!tile.img) continue;
        const [x, y] = tileset.tileToImgCoords(tile.tileX, tile.tileY);
        const [sx, sy] = worldToScreen(x, y);
        if (sx < -tileset.tilewidth*zoom || sy < -tileset.tileheight*zoom || sx > W || sy > H) continue;
        if (filter === "" || tileset.getTileData(tile.tileX, tile.tileY, "tags", [] as string[]).some(tag => tag.startsWith(filter))) {
          ctx.drawImage(tile.img, 0, 0, tileset.tilewidth, tileset.tileheight, x, y, tileset.tilewidth, tileset.tileheight);
        }
      }
    } else if (tileset.img) {
      ctx.drawImage(tileset.img, 0, 0);
    } else {
      triggerRedraw();
      return;
    }

    if (mouseX === undefined || mouseY === undefined) return;

    ctx.lineWidth = 1/zoom;
    if (mouseOver) {
      if (tool === Tool.Select) {
        const [tileX, tileY] = tileset.imgCoordsToTile(mouseX, mouseY);
        const [x, y] = tileset.tileToImgCoords(tileX, tileY);
        if (tileX != undefined && tileY !== undefined) {
          ctx.strokeStyle = "#ffffffaa";
          drawRect(ctx, x, y, tileset.tilewidth, tileset.tileheight);
        }
      } else if (tool === Tool.Edit || tool === Tool.Erase) {
        ctx.fillStyle = color;
        if (tool === Tool.Erase) {
          ctx.fillStyle = "white";
        }
        ctx.fillRect(Math.floor(mouseX), Math.floor(mouseY), 1, 1);
      }
    }
    ctx.strokeStyle = "white";
    tileset.selectedTiles.forEach(loc => {
      const [x, y] = tileset.tileToImgCoords(loc[0], loc[1]);
      drawRect(ctx, x, y, tileset.tilewidth, tileset.tileheight);
      if ((tool === Tool.Edit || tool === Tool.Erase || tool === Tool.Move) && tileset.type === "hex") {
        const r = tileset.radius();
        drawHexagon(ctx, x+0.5*tileset.tilewidth, y+tileset.tileheight-r, r);
      }
    });
  }

  function onWheel(e: WheelEvent) {
    const prevZoom = zoom;
    if (e.deltaY < 0) {
      zoom *= 1.1;
    } else if (e.deltaY > 0) {
      zoom *= 0.9;
    }
    zoom = Math.min(Math.max(0.05, zoom), 16);
    offsetX = -zoom*(e.offsetX-offsetX)/prevZoom + e.offsetX;
    offsetY = -zoom*(e.offsetY-offsetY)/prevZoom + e.offsetY;
  }

  function parseColor(color: string): number[] | undefined {
    if (color.startsWith("#")) {
      const match = color.match(/^#(\w{2})(\w{2})(\w{2})(\w{2})?$/);
      if (!match) return undefined;
      return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16), parseInt(match[4], 16) || 255];
    } else if (color.startsWith("rgb")) {
      const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(0\.\d+)?\)$/);
      if (!match) return undefined;
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), Math.round(parseFloat(match[4])*255) || 255];
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
    setTool(Tool.Edit);
  }

  function onPointerDown(e: PointerEvent) {
    [mouseX, mouseY] = screenToWorld(e.offsetX, e.offsetY);
    [dragX, dragY] = [mouseX, mouseY];
    mouseDown = true;
    if (tool === Tool.Edit) {
      tileset.setPixel(
        Math.floor(mouseX), Math.floor(mouseY),
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16),
        Math.round(alpha));
      tileset = tileset;
    } else if (tool === Tool.Erase) {
      tileset.setPixel(Math.floor(mouseX), Math.floor(mouseY), 0, 0, 0, 0);
      tileset = tileset;
    } else if (tool == Tool.Select) {
      const [x, y] = screenToWorld(e.offsetX, e.offsetY);
      if (!tileset.img) return;
      if (x < 0 || x >= tileset.img.width || y < 0 || y >= tileset.img.height) {
        return;
      }
      const [tileX, tileY] = tileset.imgCoordsToTile(x, y);
      if (e.shiftKey) {
        tileset.toggleSelectedTile(tileX, tileY);
      } else {
        tileset.setSelectedTile(tileX, tileY);
        if (tagInput) {
          tagInput.focus();
        }
      }
      tagString = Array.from(tileset.selectionTags().values()).join(',');
      tileset = tileset;
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (e.ctrlKey) {
      offsetX += e.movementX;
      offsetY += e.movementY;
    }
    [mouseX, mouseY] = screenToWorld(e.offsetX, e.offsetY);

    if (mouseDown) {
      if (tool === Tool.Edit) {
        tileset.setPixel(
          Math.floor(mouseX), Math.floor(mouseY),
          parseInt(color.slice(1, 3), 16),
          parseInt(color.slice(3, 5), 16),
          parseInt(color.slice(5, 7), 16),
          Math.round(alpha));
        tileset = tileset;
      } else if (tool === Tool.Erase) {
        tileset.setPixel(Math.floor(mouseX), Math.floor(mouseY), 0, 0, 0, 0);
        tileset = tileset;
      } else if (tool == Tool.Select && dragX !== undefined && dragY !== undefined) {
        tileset.clearSelectedTiles();
        let [x1, y1] = tileset.imgCoordsToTile(dragX, dragY);
        let [x2, y2] = tileset.imgCoordsToTile(mouseX, mouseY);
        if (x1 > x2) {
          [x1, x2] = [x2, x1];
        }
        if (y1 > y2) {
          [y1, y2] = [y2, y1];
        }
        for (let x = x1; x <= x2; x++) {
          for (let y = y1; y <= y2; y++) {
            tileset.toggleSelectedTile(x, y);
          }
        }
        tileset = tileset;
      }
    }
  }

  function onPointerCancel(e: PointerEvent) {
    [dragX, dragY] = [undefined, undefined];
  }

  function onPointerUp(e: PointerEvent) {
    mouseDown = false;
    [dragX, dragY] = [undefined, undefined];
  }

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    if (!file) return;
    Tileset.loadFromFile(file).then(_tileset => {
      tileset = _tileset;
      offsetX = 0;
      offsetY = 0;
      zoom = 2;
    });
  }

  function onTagsChanged(e: Event) {
    const tags = new Set((e.target as HTMLInputElement).value.split(','));
    tileset.setSelectionTags(tags);
    tagString = Array.from(tileset.selectionTags().values()).join(',');
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
        e.preventDefault();
        break;
      case e.key === "y" && e.ctrlKey:
        tileset.redo();
        e.preventDefault();
        break;
      case e.key === "s" && e.ctrlKey:
        tileset.download();
        e.preventDefault();
        break;
      case e.key === "c" && e.ctrlKey:
        tileset.copy();
        e.preventDefault();
        break;
      case e.key === "v" && e.ctrlKey:
        tileset.paste();
        e.preventDefault();
        break;
      case (e.key === "Backspace" || e.key === "Delete") && tileset.selectedTiles.length === 1:
        tileset.clear();
        e.preventDefault();
        break;
      case e.key === "z" && tileset.selectedTiles.length === 1:
        const [w, h] = [canvas?.width || 0, canvas?.height || 0];
        const maxZoom = Math.min(w, h)/Math.max(tileset.tilewidth, tileset.tileheight);
        const [x, y] = tileset.tileToImgCoords(tileset.selectedTiles[0][0], tileset.selectedTiles[0][1]);
        zoom = maxZoom;
        const centerX = (w/2)-(tileset.tilewidth*zoom)/2;
        offsetX = -x*zoom + centerX;
        offsetY = -y*zoom;
        e.preventDefault();
        break;
      case e.key === "i" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0][0], tileset.selectedTiles[0][1]-1);
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "k" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0][0], tileset.selectedTiles[0][1]+1);
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "j" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0][0]-1, tileset.selectedTiles[0][1]);
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "l" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0][0]+1, tileset.selectedTiles[0][1]);
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "ArrowLeft" && tool === Tool.Move:
        tileset.move(-1, 0);
        e.preventDefault();
        break;
      case e.key === "ArrowRight" && tool === Tool.Move:
        tileset.move(1, 0);
        e.preventDefault();
        break;
      case e.key === "ArrowUp" && tool === Tool.Move:
        tileset.move(0, -1);
        e.preventDefault();
        break;
      case e.key === "ArrowDown" && tool === Tool.Move:
        tileset.move(0, 1);
        e.preventDefault();
        break;
      case e.key === "ArrowLeft":
        if (e.shiftKey) {
          offsetX += zoom;
        } else {
          offsetX += zoom*tileset.offsetWidth();
        }
        e.preventDefault();
        break;
      case e.key === "ArrowRight":
        if (e.shiftKey) {
          offsetX -= zoom;
        } else {
          offsetX -= zoom*tileset.offsetWidth();
        }
        e.preventDefault();
        break;
      case e.key === "ArrowUp":
        if (e.shiftKey) {
          offsetY += zoom;
        } else {
          offsetY += zoom*tileset.offsetHeight();
        }
        e.preventDefault();
        break;
      case e.key === "ArrowDown":
        if (e.shiftKey) {
          offsetY -= zoom;
        } else {
          offsetY -= zoom*tileset.offsetHeight();
        }
        e.preventDefault();
        break;
      case e.key === "Escape":
        tileset.clearSelectedTiles();
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
    // Note: Adding bitmap here would make sense but has bad performance. Needs investigation.
    color, alpha,
    tool,
    zoom, offsetX, offsetY, filter,
    mouseX, mouseY, mouseOver);
</script>

<svelte:window on:keydown={onKeyDown} />
<div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;" style:max-width={maxWidth}>
  <div style="display: flex; gap: 8px; align-items: end; flex-wrap: wrap;">
    <input
      type="file"
      accept="image/png"
      on:change={onLoad} />
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="name">Name</label>
      <input
        name="name"
        type="text"
        bind:value={tileset.name}
      />
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
    <div style="margin-left: auto; display: flex; gap: 8px;">
      <button on:click={() => setTool(Tool.Select)} class:active={tool === Tool.Select}>
        <Icon name="openSelectHandGesture" />
      </button>
      <button on:click={() => setTool(Tool.Edit)} class:active={tool === Tool.Edit}>
        <Icon name="editPencil" />
      </button>
      <button on:click={() => setTool(Tool.Erase)} class:active={tool === Tool.Erase}>
        <Icon name="erase" />
      </button>
      <button on:click={() => setTool(Tool.Move)} class:active={tool === Tool.Move}>
        <Icon name="drag" />
      </button>
      <button on:click={() => tileset.flip('x')} disabled={tileset.selectedTiles.length !== 1}>
        <Icon name="flipHoriz" />
      </button>
      <button on:click={() => tileset.flip('y')} disabled={tileset.selectedTiles.length !== 1}>
        <Icon name="flipVert" />
      </button>
      <button on:click={tileset.rotate} disabled={tileset.selectedTiles.length !== 1}>
        <Icon name="cropRotateTl" />
        <input
          type="number"
          min="0" max="90" bind:value={degrees}
          on:click={(e) => e.stopPropagation()}
          disabled={tileset.selectedTiles.length !== 1} />
      </button>
      <button on:click={tileset.undo} disabled={tileset.undoStack.length === 0}>
        <Icon name="undo" />
      </button>
      <button on:click={tileset.redo} disabled={tileset.redoStack.length === 0}>
        <Icon name="redo" />
      </button>
      <button on:click={tileset.clear}>
        <Icon name="deleteCircle" />
      </button>
      <button on:click={tileset.copy}>
        <Icon name="copy" />
      </button>
      <button on:click={tileset.paste}>
        <Icon name="pasteClipboard" />
      </button>
      <button disabled={!tileset.img} on:click={tileset.download}>
        <Icon name="saveFloppyDisk" />
      </button>
    </div>
  </div>
  <div style="display: flex; gap: 8px; align-items: end;">
    <input
      name="filter"
      type="text"
      placeholder="Filter"
      bind:value={filter}
    />
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
      on:pointerenter={() => { if (canvas) canvas.focus(); mouseOver = true; }}
      on:pointerleave={() => { mouseOver = false; }}
    />
  </div>
  <div style="display: flex; flex-direction: row; gap: 8px; align-items: start;">
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
    <input type="color" name="color" on:change={setColor} value={color.substring(0, Math.min(color.length, 7))} />
    <input type="range" min="0" max="255" bind:value={alpha} />
    <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 12px;">
      {#each tileset.palette() as color}
        <button
          on:click={setColor}
          style:background-color={color}
          class="palette" />
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