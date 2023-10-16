<script lang="ts" context="module">
  enum Tool { Select, Edit, Erase };
</script>

<script lang="ts">
  import Icon from "./Icon.svelte";
  import { DATA_PNG, readMetadata, writeMetadata } from "./PNGMetadata";
  import { readFileAsBinaryString } from "./files";
  import type { Tileset } from "./types";

  export let tileset: HTMLImageElement;
  export let tileWidth: number | undefined, tileHeight: number | undefined;
  export let margin: number = 0;
  export let spacing: number = 0;
  export let selectedTileX: number | undefined, selectedTileY: number | undefined;

  let tagInput: HTMLInputElement;
  let canvas: HTMLCanvasElement;
  let zoom: number = 2;
  let mouseOver: boolean = false;
  let mouseDown: boolean = false;
  let offsetX: number = 0, offsetY: number = 0;
  let mouseX: number | undefined, mouseY: number | undefined;
  let widthInTiles: number | undefined, heightInTiles: number | undefined;
  let selectedTileIndex: number | undefined;
  let tilesetName: string;
  let tileTags: string;
  let tags: { [key: number]: string } = {};
  let filter: string;
  let tool: Tool = Tool.Select;
  let imgData: ImageData;
  let img: ImageBitmap;
  // TODO: select from palette, select transparency level
  let color: string = "#ffffff";
  let palette: Set<string> = new Set<string>();

  function screenToWorld(x: number, y: number): number[] {
    return [(x-offsetX)/zoom, (y-offsetY)/zoom];
  }

  function worldToTile(x: number, y: number): number[] {
    if (!tileWidth || !tileHeight) return [0, 0];
    return [
      Math.floor((x-margin) / (tileWidth+spacing)),
      Math.floor((y-margin) / (tileHeight+spacing)),
    ];
  }

  function tileToWorld(x: number, y: number): number[] {
    if (!tileWidth || !tileHeight) return [0, 0];
    return [
      x*(tileWidth+spacing)+margin,
      y*(tileHeight+spacing)+margin,
    ];
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

    if (img) {
      ctx.drawImage(img, 0, 0, img.width, img.height);
    } else if (tileset && tileset.complete && imgData) {
      createImageBitmap(imgData).then(_img => { img = _img });
      requestAnimationFrame(draw);
    }

    if (mouseX === undefined || mouseY === undefined) return;

    if (
        (tool === Tool.Edit || tool === Tool.Erase) && mouseDown &&
        selectedTileX !== undefined && selectedTileY !== undefined &&
        tileWidth && tileHeight
    ) {
      const x = Math.floor(mouseX);
      const y = Math.floor(mouseY);
      const [x1, y1] = tileToWorld(selectedTileX, selectedTileY);
      const [x2, y2] = tileToWorld(selectedTileX+1, selectedTileY+1);
      if (
          x >= 0 && x < imgData.width &&
          y >= 0 && y < imgData.height &&
          x >= x1 && x < x2 && y >= y1 && y < y2 
      ) {
        const i = ((y * imgData.width) + x) * 4;
        if (tool === Tool.Edit) {
          imgData.data[i+0] = parseInt(color.slice(1, 3), 16);
          imgData.data[i+1] = parseInt(color.slice(3, 5), 16);
          imgData.data[i+2] = parseInt(color.slice(5, 7), 16);
          imgData.data[i+3] = 255;
        } else {
          imgData.data[i+0] = 0;
          imgData.data[i+1] = 0;
          imgData.data[i+2] = 0;
          imgData.data[i+3] = 0;
        }
        createImageBitmap(imgData).then(_img => { img = _img; });
      }
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    if (tileWidth !== undefined && tileHeight !== undefined) {
      if (tool === Tool.Select) {
        const [tileX, tileY] = worldToTile(mouseX, mouseY);
        const [x1, y1] = tileToWorld(tileX, tileY);
        const [x2, y2] = tileToWorld(tileX+1, tileY+1);
        if (tileX != undefined && tileY !== undefined) {
          drawRect(ctx, x1, y1, x2-x1, y2-y1);
        }
      } else {
        // TODO: draw outline around editing pixel
      }
      if (selectedTileX !== undefined && selectedTileY !== undefined) {
        const [x1, y1] = tileToWorld(selectedTileX, selectedTileY);
        const [x2, y2] = tileToWorld(selectedTileX+1, selectedTileY+1);
        drawRect(ctx, x1, y1, x2-x1, y2-y1);
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
    zoom = Math.min(Math.max(0.05, zoom), 16);
    offsetX = -zoom*(e.offsetX-offsetX)/prevZoom + e.offsetX;
    offsetY = -zoom*(e.offsetY-offsetY)/prevZoom + e.offsetY;
  }

  function onClick(e: MouseEvent) {
    if (tool !== Tool.Select) return;
    const [x, y] = screenToWorld(e.offsetX, e.offsetY);
    if (x < 0 || x >= tileset.width || y < 0 || y >= tileset.height) {
      return;
    }
    if (tileWidth !== undefined && tileHeight !== undefined && widthInTiles !== undefined) {
      [selectedTileX, selectedTileY] = worldToTile(x, y);
      selectedTileIndex = selectedTileY*widthInTiles + selectedTileX;
      tileTags = tags[selectedTileIndex] || "";
      tagInput.focus();
      palette.clear();
      for (let x = selectedTileX*tileWidth; x < (selectedTileX+1)*tileWidth; x++) {
        for (let y = selectedTileY*tileHeight; y < (selectedTileY+1)*tileHeight; y++) {
          const i = ((y * imgData.width) + x) * 4;
          palette.add("#" + 
            imgData.data[i+0].toString(16) +
            imgData.data[i+1].toString(16) +
            imgData.data[i+2].toString(16));
        }
      }
      palette = palette;
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (e.buttons === 1) {
      onClick(e);
    } else if (e.ctrlKey) {
      offsetX += e.movementX;
      offsetY += e.movementY;
    }
    if (tileWidth !== undefined && tileHeight !== undefined) {
      [mouseX, mouseY] = screenToWorld(e.offsetX, e.offsetY);
    }
  }

  function onFileChanged(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    if (!file) return;
    readFileAsBinaryString(file).then(value => {
      tileset.setAttribute('src', DATA_PNG + btoa(value));
      tileset.onload = () => {
        const tmp = document.createElement('canvas');
        tmp.width = tileset.width;
        tmp.height = tileset.height;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.resetTransform();
        context.drawImage(tileset, 0, 0, tmp.width, tmp.height);
        imgData = context.getImageData(0, 0, tmp.width, tmp.height);
        createImageBitmap(imgData).then(_img => { img = _img });
      };
      tilesetName = "";
      tileWidth = undefined;
      tileHeight = undefined;
      margin = 0;
      spacing = 0;
      tileTags = "";
      tags = {};
      selectedTileX = 0;
      selectedTileY = 0;
      selectedTileIndex = 0;
      offsetX = 0;
      offsetY = 0;
      zoom = 2;
      const metadata = readMetadata(value) as Tileset;
      if (metadata) {
        tilesetName = metadata.name || "";
        tileWidth = metadata.tilewidth;
        tileHeight = metadata.tileheight;
        margin = metadata.margin || 0;
        spacing = metadata.spacing || 0;
        tags = Object.fromEntries(Object.entries(metadata.tiledata).map(([tileID, properties]) => {
          return [tileID, properties["tags"].join(",")];
        }));
      }
    });
  }

  function onTileTagsChanged() {
    if (selectedTileIndex !== undefined) {
      tags[selectedTileIndex] = tileTags;
    }
  }

  function onSave() {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.drawImage(img, 0, 0);
    const value = writeMetadata(atob(canvas.toDataURL('image/png').substring(DATA_PNG.length)), {
      name: tilesetName,
      type: "hex",
      tilewidth: tileWidth,
      tileheight: tileHeight,
      margin: margin,
      spacing: spacing,
      tileoffset: { x: 0, y: 0 },
      tiledata: Object.fromEntries(Object.entries(tags).map(([tileID, tags]) => {
        return [tileID, { tags: tags.split(",") }];
      })),
    } as Tileset);
    tileset.setAttribute('src', DATA_PNG + btoa(value));
    const a = document.createElement('a');
    a.href = tileset.src;
    if (tilesetName) {
      a.download = `${tilesetName}.png`;
    } else {
      a.download = 'tileset.png';
    }
    a.click();
  }

  function triggerRedraw(..._args: any[]) {
    if (tileset && tileWidth !== undefined && tileHeight !== undefined) {
      widthInTiles = tileset.width/tileWidth;
      heightInTiles = tileset.height/tileHeight;
    }
    if (tileset && tileset.complete) {
      requestAnimationFrame(draw);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!mouseOver) return;
    if (tileWidth === undefined || tileHeight === undefined) return;
    switch (e.key) {
      case "ArrowLeft":
        offsetX += zoom*tileWidth;
        e.preventDefault();
        break;
      case "ArrowRight":
        offsetX -= zoom*tileWidth;
        e.preventDefault();
        break;
      case "ArrowUp":
        offsetY += zoom*tileHeight;
        e.preventDefault();
        break;
      case "ArrowDown":
        offsetY -= zoom*tileHeight;
        e.preventDefault();
        break;
    }
    requestAnimationFrame(draw);
  }

  function copySelectedTile() {
    // TODO
  }

  function pasteSelectedTile() {
    // TODO
  }

  $: triggerRedraw(
    tileset,
    tileWidth, tileHeight,
    zoom, offsetX, offsetY, filter,
    mouseX, mouseY,
    selectedTileX, selectedTileY);
</script>

<svelte:window on:keydown={onKeyDown} />
<div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
  <div style="display: flex; gap: 8px; align-items: end;">
    <input
      type="file"
      accept="image/png"
      on:change={onFileChanged} />
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="name">Name</label>
      <input
        name="name"
        type="text"
        bind:value={tilesetName}
      />
    </div>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="width">Width</label>
      <input
        name="width"
        type="number"
        bind:value={tileWidth}
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
        bind:value={tileHeight}
        min="1"
        max="64"
        style="max-width: 4em;"
      />
    </div>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="Margin">Margin</label>
      <input
        name="margin"
        type="number"
        bind:value={margin}
        min="1"
        max="64"
        style="max-width: 4em;"
      />
    </div>
    <div style="display: flex; flex-direction: column; align-items: start;">
      <label for="Spacing">Spacing</label>
      <input
        name="spacing"
        type="number"
        bind:value={spacing}
        min="1"
        max="64"
        style="max-width: 4em;"
      />
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
      <button on:click={copySelectedTile}>
        <Icon name="copy" />
      </button>
      <button on:click={pasteSelectedTile}>
        <Icon name="pasteClipboard" />
      </button>
      <button disabled={!tileset || !tileset.src} on:click={onSave}>
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
  <img
    bind:this={tileset}
    src=""
    style="display: none;"
    alt="Tileset"
  />
  <div class="canvas">
    <canvas
      style="position: absolute;"
      bind:this={canvas}
      on:wheel={onWheel}
      on:click={onClick}
      on:pointermove={onPointerMove}
      on:pointerdown={() => { mouseDown = true; }}
      on:pointerup={() => { mouseDown = false; }}
      on:pointerenter={() => { canvas.focus(); mouseOver = true; }}
      on:pointerleave={() => { mouseOver = false; }}
    />
  </div>
  {#if selectedTileX !== undefined && selectedTileY !== undefined}
    <div style="display: flex; flex-direction: row; gap: 8px; align-items: start;">
      <div>
        Selected: Tile {selectedTileIndex} ({selectedTileX}, {selectedTileY})
      </div>
      <div style="display: flex; flex-direction: column; align-items: start;">
        <label for="tags">Tags</label>
        <input
          name="tags"
          type="text"
          on:change={onTileTagsChanged}
          bind:value={tileTags}
          bind:this={tagInput}
        />
      </div>
      <input type="color" name="color" bind:value={color} />
      <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 12px;">
        {#each palette as color}
          <button style:background-color={color} class="palette" />
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .canvas {
    border: 2px solid white;
    margin: 0;
    padding: 0;
    flex-grow: 1;
  }
</style>