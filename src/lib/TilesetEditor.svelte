<script lang="ts">
  import { readMetadata, writeMetadata } from "./PNGMetadata";
  import { readFileAsBinaryString } from "./files";

  export let tileset: HTMLImageElement;
  export let tileWidth: number | undefined, tileHeight: number | undefined;
  export let selectedTileX: number | undefined, selectedTileY: number | undefined;

  const DATA_PNG = "data:image/png;base64,"

  let mergeTileset: HTMLImageElement;
  let fileInput: HTMLInputElement;
  let tagInput: HTMLInputElement;
  let mergeFileInput: HTMLInputElement;
  let canvas: HTMLCanvasElement;
  let zoom: number = 2;
  let mouseOver: boolean = false;
  let offsetX: number = 0, offsetY: number = 0;
  let hoverX: number | undefined, hoverY: number | undefined;
  let widthInTiles: number | undefined, heightInTiles: number | undefined;
  let selectedTileIndex: number | undefined;
  let tilesetName: string;
  let tileTags: string;
  let tags: { [key: number]: string } = {};
  let filter: string;

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

  function draw() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(zoom, 0, 0, zoom, offsetX, offsetY);

    if (tileset && tileset.complete) {
      if (tileWidth !== undefined && tileHeight !== undefined && widthInTiles !== undefined && heightInTiles !== undefined) {
        for (let x = 0; x < widthInTiles; x++) {
          for (let y = 0; y < heightInTiles; y++) {
            const tileID = y*widthInTiles+x;
            if (filter === undefined || filter === "" || tags[tileID]?.includes(filter)) {
              ctx.drawImage(
                tileset,
                x*tileWidth, y*tileHeight,
                tileWidth, tileHeight,
                x*tileWidth, y*tileHeight,
                tileWidth, tileHeight);
            }
          }
        }
      } else {
        ctx.drawImage(tileset, 0, 0, tileset.width, tileset.height);
      }
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    if (tileWidth !== undefined && tileHeight !== undefined) {
      if (hoverX != undefined && hoverY !== undefined) {
        drawRect(ctx, hoverX*tileWidth, hoverY*tileHeight, tileWidth, tileHeight);
      }
      if (selectedTileX !== undefined && selectedTileY !== undefined) {
        drawRect(ctx, selectedTileX*tileWidth, selectedTileY*tileHeight, tileWidth, tileHeight);
      }
    }
  }

  function mergeTilesets(tilesetA: HTMLImageElement, tilesetB: HTMLImageElement): string | undefined {
    const canvas = document.createElement('canvas');
    canvas.width = tilesetA.width + tilesetB.width;
    canvas.height = Math.max(tilesetA.height, tilesetB.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.drawImage(tilesetA, 0, 0, tilesetA.width, tilesetA.height);
    ctx.drawImage(tilesetB, tilesetA.width, 0, tilesetB.width, tilesetB.height);
    return canvas.toDataURL('image/png');
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

  function onClick(e: MouseEvent) {
    const [x, y] = screenToWorld(e.offsetX, e.offsetY);
    if (x < 0 || x >= tileset.width || y < 0 || y >= tileset.height) {
      return;
    }
    if (tileWidth !== undefined && tileHeight !== undefined && widthInTiles !== undefined) {
      selectedTileX = Math.floor(x / tileWidth);
      selectedTileY = Math.floor(y / tileHeight);
      selectedTileIndex = selectedTileY*widthInTiles + selectedTileX;
      tileTags = tags[selectedTileIndex] || "";
      //tagInput.focus();
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (e.buttons === 1) {
      onClick(e);
    } else if (e.ctrlKey) {
      offsetX += e.movementX;
      offsetY += e.movementY;
    }
    if (tileWidth !== undefined && tileHeight !== undefined) {
      const [x, y] = screenToWorld(e.offsetX, e.offsetY);
      hoverX = Math.floor(x / tileWidth);
      hoverY = Math.floor(y / tileHeight);
    }
  }

  function onFileChanged() {
    if (!fileInput || !fileInput.files) return;
    const file = fileInput.files[0];
    if (!file) return;
    readFileAsBinaryString(file).then(value => {
      tileset.setAttribute('src', DATA_PNG + btoa(value));
      tileset.onload = () => {
        requestAnimationFrame(draw);
      };
      tilesetName = "";
      tileWidth = undefined;
      tileHeight = undefined;
      tileTags = "";
      tags = {};
      selectedTileX = 0;
      selectedTileY = 0;
      selectedTileIndex = 0;
      offsetX = 0;
      offsetY = 0;
      zoom = 2;
      const metadata = readMetadata(value);
      if (metadata) {
        tilesetName = metadata.name || "";
        tileWidth = metadata.tileWidth;
        tileHeight = metadata.tileHeight;
        tags = metadata.tags || {};
      }
    });
  }

  function onMergeFileChanged() {
    if (!mergeFileInput || !mergeFileInput.files) return;
    const file = mergeFileInput.files[0];
    if (!file) return;
    readFileAsBinaryString(file).then(value => {
      mergeTileset.onload = () => {
        const merged = mergeTilesets(tileset, mergeTileset);
        if (merged) {
          tileset.setAttribute('src', merged);
          tileset.onload = () => {
            requestAnimationFrame(draw);
          };
        }
        mergeTileset.setAttribute('src', '');
      }
      mergeTileset.setAttribute('src', DATA_PNG + btoa(value));
    });
  }

  function onTileTagsChanged() {
    if (selectedTileIndex !== undefined) {
      tags[selectedTileIndex] = tileTags;
    }
  }

  function onSave() {
    const value = writeMetadata(atob(tileset.src.substring(DATA_PNG.length)), {
      name: tilesetName,
      tileWidth: tileWidth,
      tileHeight: tileHeight,
      tags: tags,
    });
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
    requestAnimationFrame(draw);
  }

  function onKeyDown(e: KeyboardEvent) {
    console.log("tileset");
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

  $: triggerRedraw(
    tileset, mergeTileset,
    tileWidth, tileHeight,
    zoom, offsetX, offsetY, filter,
    hoverX, hoverY,
    selectedTileX, selectedTileY);
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <div style="display: flex; gap: 8px; align-items: end;">
    <input
      type="file"
      accept="image/png"
      bind:this={fileInput}
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
    <div style="margin-left: auto; display: flex; gap: 8px;">
      {#if tileset && tileset.src}
        <label for="merge">
          <button on:click={() => { mergeFileInput.click() }}>
            Merge Tileset
          </button>
          <input
            bind:this={mergeFileInput}
            on:change={onMergeFileChanged}
            style="display: none;"
            name="merge"
            type="file"
            accept="image/png" />
        </label>
      {/if}
      <button on:click={onSave}>
        Save
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
  />
  <img
    bind:this={mergeTileset}
    src=""
    style="display: none;"
  />
  <canvas
    class="canvas"
    tabindex="1"
    bind:this={canvas}
    on:wheel={onWheel}
    on:click={onClick}
    on:mousemove={onMouseMove}
    on:keydown={onKeyDown}
    on:mouseenter={() => { canvas.focus(); mouseOver = true; }}
    on:mouseleave={() => { mouseOver = false; }}
    width={400}
    height={400}
  />
  {#if selectedTileX !== undefined && selectedTileY !== undefined}
    <div style="display: flex; flex-direction: column; gap: 8px; align-items: start;">
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
    </div>
  {/if}
</div>

<style>
  .canvas {
    border: 2px solid white;
    padding: 1px;
    flex-grow: 0;
    width: 400px;
    height: 400px;
  }
</style>