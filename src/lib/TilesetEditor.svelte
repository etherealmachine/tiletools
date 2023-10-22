<script lang="ts" context="module">
  enum Tool { Select, Edit, Erase };
</script>

<script lang="ts">
  import Icon from "./Icon.svelte";
  import { PNGWithMetadata } from "./PNGWithMetadata";
  import Tileset from "./Tileset";

  export let tileset: Tileset = new Tileset({});
  export let maxWidth: string | undefined = undefined;

  let canvas: HTMLCanvasElement | undefined;
  let zoom: number = 2;
  let mouseOver: boolean = false;
  let mouseDown: boolean = false;
  let offsetX: number = 0, offsetY: number = 0;
  let mouseX: number | undefined, mouseY: number | undefined;
  let tagString: string = "";
  let tagInput: HTMLInputElement | undefined;
  let filter: string = "";
  let tool: Tool = Tool.Select;
  let imgData: ImageData | undefined;
  let dirty: boolean = false;
  let bitmap: ImageBitmap | undefined;
  let color: string = "#ffffff";
  let opacity: number = 100;
  let palette: Set<string> = new Set<string>();
  let copyBuffer: ImageData | undefined;
  let undoStack: ImageData[] = [];
  let redoStack: ImageData[] = [];

  function screenToWorld(x: number, y: number): number[] {
    return [(x-offsetX)/zoom, (y-offsetY)/zoom];
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

  function updateBitmap(redraw: boolean = false) {
    if (!imgData) return;
    createImageBitmap(imgData).then(img => {
      bitmap = img;
      if (redraw) { triggerRedraw() };
    });
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

    if (tileset && bitmap) {
      for (let tileX = 0; tileX < tileset.widthInTiles(); tileX++) {
        for (let tileY = 0; tileY < tileset.heightInTiles(); tileY++) {
          if (filter === "" || tileset.getTileData(tileX, tileY, "tags", [] as string[]).some(tag => tag.startsWith(filter))) {
            const [x, y] = tileset.tileToImgCoords(tileX, tileY);
            ctx.drawImage(bitmap, x, y, tileset.tilewidth, tileset.tileheight, x, y, tileset.tilewidth, tileset.tileheight);
          }
        }
      }
    } else if (tileset && tileset.img && tileset.loaded() && !imgData) {
      const tmp = document.createElement('canvas');
      tmp.width = tileset.img.width;
      tmp.height = tileset.img.height;
      const context = tmp.getContext('2d');
      if (!context) return;
      context.resetTransform();
      context.drawImage(tileset.img, 0, 0, tmp.width, tmp.height);
      imgData = context.getImageData(0, 0, tmp.width, tmp.height);
      updateBitmap();
      pushStack(undoStack);
    }

    if (mouseX === undefined || mouseY === undefined) return;

    if (
        imgData &&
        copyBuffer === undefined &&
        (tool === Tool.Edit || tool === Tool.Erase) && mouseDown
    ) {
      if (!dirty) {
        pushStack(undoStack);
        dirty = true;
      }
      const x = Math.floor(mouseX);
      const y = Math.floor(mouseY);
      if (tileset.inSelection(x, y)) {
        const i = ((y * imgData.width) + x) * 4;
        if (tool === Tool.Edit) {
          imgData.data[i+0] = parseInt(color.slice(1, 3), 16);
          imgData.data[i+1] = parseInt(color.slice(3, 5), 16);
          imgData.data[i+2] = parseInt(color.slice(5, 7), 16);
          imgData.data[i+3] = Math.round(255*(opacity/100));
        } else {
          imgData.data[i+0] = 0;
          imgData.data[i+1] = 0;
          imgData.data[i+2] = 0;
          imgData.data[i+3] = 0;
        }
        updateBitmap();
      }
    } else {
      dirty = false;
    }

    ctx.strokeStyle = "white";
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    if (mouseOver) {
      if (tool === Tool.Select) {
        const [tileX, tileY] = tileset.imgCoordsToTile(mouseX, mouseY);
        const [x1, y1] = tileset.tileToImgCoords(tileX, tileY);
        const [x2, y2] = tileset.tileToImgCoords(tileX+1, tileY+1);
        if (tileX != undefined && tileY !== undefined) {
          drawRect(ctx, x1, y1, x2-x1, y2-y1);
        }
      } else if (tool === Tool.Edit || tool === Tool.Erase) {
        if (tool === Tool.Erase) {
          ctx.fillStyle = "white";
        }
        ctx.fillRect(Math.floor(mouseX), Math.floor(mouseY), 1, 1);
      }
    }
    tileset.selectedTiles.forEach(loc => {
      const [x1, y1] = tileset.tileToImgCoords(loc[0], loc[1]);
      const [x2, y2] = tileset.tileToImgCoords(loc[0]+1, loc[1]+1);
      drawRect(ctx, x1, y1, x2-x1, y2-y1);
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

  function onClick(e: MouseEvent) {
    if (tool !== Tool.Select) return;
    const [x, y] = screenToWorld(e.offsetX, e.offsetY);
    if (!tileset.img) return;
    if (x < 0 || x >= tileset.img.width || y < 0 || y >= tileset.img.height) {
      return;
    }
    const [tileX, tileY] = tileset.imgCoordsToTile(x, y);
    // TODO: Multi-select with drag
    if (e.shiftKey) {
      tileset.addSelectedTile(tileX, tileY);
    } else {
      tileset.setSelectedTile(tileX, tileY);
      if (tagInput) {
        tagInput.focus();
      }
    }
    tagString = Array.from(tileset.selectionTags().values()).join(',');
    palette.clear();
    tileset.selectedTiles.forEach(([x, y]) => {
      const [x1, y1] = tileset.tileToImgCoords(x, y);
      const [x2, y2] = tileset.tileToImgCoords(x+1, y+1);
      if (imgData) {
        for (let x = x1; x < x2; x++) {
          for (let y = y1; y < y2; y++) {
            const i = ((y * imgData.width) + x) * 4;
            palette.add("#" + 
              imgData.data[i+0].toString(16) +
              imgData.data[i+1].toString(16) +
              imgData.data[i+2].toString(16) +
              imgData.data[i+3].toString(16));
          }
        }
      }
    });
    palette = palette;
  }

  function setColor(e: Event) {
    color = (e.target as HTMLButtonElement).style.backgroundColor;
  }

  function onPointerMove(e: PointerEvent) {
    if (e.buttons === 1) {
      onClick(e);
    } else if (e.ctrlKey) {
      offsetX += e.movementX;
      offsetY += e.movementY;
    }
    [mouseX, mouseY] = screenToWorld(e.offsetX, e.offsetY);
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

  // TODO: Make save different from download
  function onSave() {
    if (bitmap) {
      const png = new PNGWithMetadata(tileset.name, tileset.metadata(), bitmap);
      png.download();
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!mouseOver) return;
    // TODO: Allow smaller offsets than a full tile
    // TODO: Hotkeys: Zoom to tile, Copy/Paste, Save, Undo/Redo, Select, Edit, Erase, Vim-Like Tile Navigation
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
  }

  function pushStack(stack: ImageData[], clearRedo: boolean = true) {
    if (!imgData) return;
    const copy = new ImageData(imgData.width, imgData.height);
    for (let i = 0; i < imgData.width*imgData.height*4; i++) {
      copy.data[i] = imgData.data[i];
    }
    stack.push(copy);
    if (clearRedo) {
      redoStack = [];
    }
  }

  function undo() {
    if (!imgData) return;
    const last = undoStack.pop();
    if (!last) return;
    pushStack(redoStack, false);
    imgData = last;
    updateBitmap(true);
  }

  function redo() {
    if (!imgData) return;
    const last = redoStack.pop();
    if (!last) return;
    pushStack(undoStack, false);
    imgData = last;
    updateBitmap(true);
  }

  function copy() {
    if (imgData && tileset.selectedTiles.length === 1) {
      const [x1, y1] = tileset.tileToImgCoords(tileset.selectedTiles[0][0], tileset.selectedTiles[0][1]);
      copyBuffer = new ImageData(tileset.tilewidth, tileset.tileheight);
      for (let x = 0; x < tileset.tilewidth; x++) {
        for (let y = 0; y < tileset.tileheight; y++) {
          const i = (((y1+y) * imgData.width) + (x1+x)) * 4;
          const j = ((y * copyBuffer.width) + x) * 4;
          copyBuffer.data[j+0] = imgData.data[i+0];
          copyBuffer.data[j+1] = imgData.data[i+1];
          copyBuffer.data[j+2] = imgData.data[i+2];
          copyBuffer.data[j+3] = imgData.data[i+3];
        }
      }
    }
  }

  function paste() {
    // TODO: What about expanding the width/height of the tileset?
    if (copyBuffer && imgData && tileset.selectedTiles.length === 1) {
      pushStack(undoStack);
      const [x1, y1] = tileset.tileToImgCoords(tileset.selectedTiles[0][0], tileset.selectedTiles[0][1]);
      for (let x = 0; x < tileset.tilewidth; x++) {
        for (let y = 0; y < tileset.tileheight; y++) {
          const i = (((y1+y) * imgData.width) + (x1+x)) * 4;
          const j = ((y * copyBuffer.width) + x) * 4;
          imgData.data[i+0] = copyBuffer.data[j+0];
          imgData.data[i+1] = copyBuffer.data[j+1];
          imgData.data[i+2] = copyBuffer.data[j+2];
          imgData.data[i+3] = copyBuffer.data[j+3];
        }
      }
      updateBitmap();
    }
  }

  function triggerRedraw(..._args: any[]) {
    if (tileset && tileset.loaded()) {
      requestAnimationFrame(draw);
    }
  }

  $: triggerRedraw(
    tileset,
    // Note: Adding bitmap here would make sense but has bad performance. Needs investigation.
    color, opacity,
    zoom, offsetX, offsetY, filter,
    mouseX, mouseY, mouseOver, mouseDown);
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
      <button on:click={() => { tool = Tool.Select }} class:active={tool === Tool.Select}>
        <Icon name="openSelectHandGesture" />
      </button>
      <button on:click={() => { tool = Tool.Edit }} class:active={tool === Tool.Edit}>
        <Icon name="editPencil" />
      </button>
      <button on:click={() => { tool = Tool.Erase }} class:active={tool === Tool.Erase}>
        <Icon name="erase" />
      </button>
      <button on:click={undo}>
        <Icon name="undo" />
      </button>
      <button on:click={redo}>
        <Icon name="redo" />
      </button>
      <button on:click={copy}>
        <Icon name="copy" />
      </button>
      <button on:click={paste}>
        <Icon name="pasteClipboard" />
      </button>
      <button disabled={!tileset.img || !tileset.img.src} on:click={onSave}>
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
      on:click={onClick}
      on:pointermove={onPointerMove}
      on:pointerdown={() => { mouseDown = true; }}
      on:pointerup={() => { mouseDown = false; }}
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
    <input type="color" name="color" bind:value={color} />
    <input type="range" min="0" max="100" bind:value={opacity} />
    <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 12px;">
      {#each palette as color}
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