<script lang="ts" context="module">
  enum Tool { Select, Edit, Erase, Move };

  interface TileImageData {
    tileX: number
    tileY: number
    data: ImageData
    dirty: boolean
    img?: ImageBitmap
  }
</script>

<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
    import { onMount } from "svelte";

  import Icon from "./Icon.svelte";
  import { PNGWithMetadata } from "./PNGWithMetadata";
  import Tileset from "./Tileset";
  import { drawHexagon, drawRect, drawTile } from "./draw";
  import rotsprite from "./rotsprite";
    import { page } from "$app/stores";

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
  let color: string = "#ffffff";
  let alpha: number = 255;
  let tileBuffer: TileImageData | undefined;
  let palette: Set<string> = new Set<string>();
  let copyBuffer: ImageData | undefined;
  let undoStack: TileImageData[] = [];
  let redoStack: TileImageData[] = [];
  let degrees: number = 90;

  onMount(() => {
    requestAnimationFrame(() => {
      const _tileset = $page.url.searchParams.get('tileset');
      if (_tileset) {
        const png = PNGWithMetadata.fromDataURL(decodeURIComponent(_tileset));
        tileset = Tileset.fromPNGWithMetadata(png);
      }
    });
  });

  function screenToWorld(x: number, y: number): number[] {
    return [(x-offsetX)/zoom, (y-offsetY)/zoom];
  }

  function worldToScreen(x: number, y: number): number[] {
    return [x*zoom+offsetX, y*zoom+offsetY];
  }

  function tileBufferChanged() {
    const buf = tileBuffer;
    if (!buf) return;
    if (buf.img && !buf.dirty) return;
    createImageBitmap(buf.data).then(img => {
      buf.img = img;
      triggerRedraw();
    });
  }

  function updateTilesetImage() {
    if (!tileBuffer || !tileBuffer.dirty || !tileBuffer.img || !tileset.img) return;
    const [x, y] = tileset.tileToImgCoords(tileBuffer.tileX, tileBuffer.tileY);
    const tmp = document.createElement('canvas');
    tmp.width = tileset.img.width;
    tmp.height = tileset.img.height;
    const ctx = tmp.getContext('2d');
    if (!ctx) return undefined;
    ctx.drawImage(tileset.img, 0, 0);
    ctx.clearRect(x, y, tileset.tilewidth, tileset.tileheight);
    ctx.drawImage(tileBuffer.img, x, y);
    createImageBitmap(ctx.getImageData(0, 0, tmp.width, tmp.height)).then(img => {
      tileset.img = img;
      triggerRedraw();
      const url = tileset.dataURL();
      // TODO: Remove path and just set url param
      goto(`${base}/tileset-editor?tileset=${encodeURIComponent(url)}`);
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

    if (tileset.img && tileset.loaded()) {
      const [w, h] = [tileset.widthInTiles(), tileset.heightInTiles()];
      if (w > 0 && h > 0) {
        for (let tileX = 0; tileX < w; tileX++) {
          for (let tileY = 0; tileY < h; tileY++) {
            const [x, y] = tileset.tileToImgCoords(tileX, tileY);
            const [sx, sy] = worldToScreen(x, y);
            if (sx < -tileset.tilewidth*zoom || sy < -tileset.tileheight*zoom || sx > W || sy > H) continue;
            if (tileBuffer && tileBuffer.tileX === tileX && tileBuffer.tileY === tileY && tileBuffer.img) {
              ctx.drawImage(tileBuffer.img, 0, 0, tileset.tilewidth, tileset.tileheight, x, y, tileset.tilewidth, tileset.tileheight);
              continue;
            }
            if (filter === "" || tileset.getTileData(tileX, tileY, "tags", [] as string[]).some(tag => tag.startsWith(filter))) {
              // Can't use drawTile because of margins and spacing
              ctx.drawImage(tileset.img, x, y, tileset.tilewidth, tileset.tileheight, x, y, tileset.tilewidth, tileset.tileheight);
            }
          }
        }
      } else {
        ctx.drawImage(tileset.img, 0, 0);
      }
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

  function getTileBuffer(): TileImageData | undefined {
    if (tileset.selectedTiles.length !== 1) return undefined;
    const [tileX, tileY] = [tileset.selectedTiles[0][0], tileset.selectedTiles[0][1]];
    if (tileBuffer && tileBuffer.tileX === tileX && tileBuffer.tileY === tileY) {
      return tileBuffer;
    } else if (tileBuffer && tileBuffer.dirty) {
      // TODO: Eliminate lag between tileBuffer being changed and the updated image being ready to draw
      updateTilesetImage();
    }
    const tmp = document.createElement('canvas');
    tmp.width = tileset.tilewidth;
    tmp.height = tileset.tileheight;
    const ctx = tmp.getContext('2d');
    if (!ctx) return undefined;
    drawTile(ctx, 0, 0, tileset, tileX, tileY);
    tileBuffer = {
      tileX, tileY,
      data: ctx.getImageData(0, 0, tmp.width, tmp.height),
      dirty: false,
    };
    return tileBuffer;
  }

  function setTileBuffer(buf: TileImageData | undefined) {
    tileBuffer = buf;
    tileBufferChanged();
    updateTilesetImage();
  }

  function computePalette() {
    const t = getTileBuffer();
    if (!t) return;
    palette.clear();
    for (let x = 0; x < t.data.width; x++) {
      for (let y = 0; y < t.data.height; y++) {
        const i = (y * t.data.width + x) * 4;
        const r = t.data.data[i+0];
        const g = t.data.data[i+1];
        const b = t.data.data[i+2];
        const a = t.data.data[i+3];
        if (r || g || b || a) {
          palette.add("#" + 
            r.toString(16) +
            g.toString(16) +
            b.toString(16) +
            a.toString(16));
        }
      }
    }
    palette = palette;
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
    mouseDown = true;
    if (e.buttons === 1 && (tool === Tool.Edit || tool === Tool.Erase)) {
      const t = getTileBuffer();
      if (!t) return;
      pushStack(t, undoStack);
      updatePixel(Math.floor(mouseX), Math.floor(mouseY));
    } else if (tool == Tool.Select) {
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
        computePalette();
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

    if (mouseDown && (tool === Tool.Edit || tool === Tool.Erase)) {
      updatePixel(Math.floor(mouseX), Math.floor(mouseY));
    }
  }

  function onPointerUp(e: PointerEvent) {
    mouseDown = false;
  }

  function updatePixel(x: number, y: number) {
    const t = getTileBuffer();
    if (!t) return;
    const [tileX, tileY] = tileset.imgCoordsToTile(x, y);
    if (t.tileX !== tileX || t.tileY !== tileY) return;
    if (tileset.inSelection(x, y)) {
      x = x % tileset.offsetWidth();
      y = y % tileset.offsetHeight();
      const i = (y * t.data.width + x) * 4;
      let [r, g, b, a] = [0, 0, 0, 0];
      if (tool === Tool.Edit) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
        a = Math.round(alpha);
      }
      t.data.data[i+0] = r;
      t.data.data[i+1] = g;
      t.data.data[i+2] = b;
      t.data.data[i+3] = a;
      t.dirty = true;
      tileBufferChanged();
      computePalette();
    }
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

  // TODO: Make save different from download, roll in to reload persistance
  function save() {
    if (tileset.img) {
      const png = new PNGWithMetadata(tileset.name, tileset.metadata(), tileset.img);
      png.download();
    }
  }

  function setTool(_tool: Tool) {
    switch (_tool) {
      case Tool.Edit:
      case Tool.Erase:
        computePalette();
        break;
    }
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
      case e.key === "c" && e.ctrlKey:
        copy();
        e.preventDefault();
        break;
      case e.key === "v" && e.ctrlKey:
        paste(false);
        e.preventDefault();
        break;
      case (e.key === "Backspace" || e.key === "Delete") && tileset.selectedTiles.length === 1:
        clear();
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
        computePalette();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "k" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0][0], tileset.selectedTiles[0][1]+1);
        computePalette();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "j" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0][0]-1, tileset.selectedTiles[0][1]);
        computePalette();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "l" && tileset.selectedTiles.length === 1:
        tileset.setSelectedTile(tileset.selectedTiles[0][0]+1, tileset.selectedTiles[0][1]);
        computePalette();
        tileset = tileset;
        e.preventDefault();
        break;
      case e.key === "ArrowLeft" && tool === Tool.Move && tileset.selectedTiles.length === 1:
        move(-1, 0);
        e.preventDefault();
        break;
      case e.key === "ArrowRight" && tool === Tool.Move && tileset.selectedTiles.length === 1:
        move(1, 0);
        e.preventDefault();
        break;
      case e.key === "ArrowUp" && tool === Tool.Move && tileset.selectedTiles.length === 1:
        move(0, -1);
        e.preventDefault();
        break;
      case e.key === "ArrowDown" && tool === Tool.Move && tileset.selectedTiles.length === 1:
        move(0, 1);
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
        setTileBuffer(undefined);
        e.preventDefault();
        break;
    }
  }

  function pushStack(buf: TileImageData, stack: TileImageData[], clearRedo: boolean = true) {
    const copy = new ImageData(buf.data.width, buf.data.height);
    for (let i = 0; i < copy.width*copy.height*4; i++) {
      copy.data[i] = buf.data.data[i];
    }
    stack.push({
      tileX: buf.tileX,
      tileY: buf.tileY,
      data: copy,
      dirty: buf.dirty,
    });
    if (clearRedo) {
      redoStack = [];
    }
    undoStack = undoStack.slice(0, Math.min(undoStack.length, 10));
    redoStack = redoStack.slice(0, Math.min(redoStack.length, 10));
  }

  function undo() {
    // TODO: Undo doesn't work on tileBuffers from different tiles are touched
    const t = getTileBuffer();
    if (!t) return;
    const last = undoStack.pop();
    if (!last) return;
    pushStack(t, redoStack, false);
    setTileBuffer(last);
  }

  function redo() {
    // TODO: Redo doesn't work on tileBuffers from different tiles are touched
    const t = getTileBuffer();
    if (!t) return;
    const last = redoStack.pop();
    if (!last) return;
    pushStack(t, undoStack, false);
    setTileBuffer(last);
  }

  function copy() {
    const t = getTileBuffer();
    if (!t) return;
    copyBuffer = new ImageData(t.data.width, t.data.height);
    for (let x = 0; x < copyBuffer.width; x++) {
      for (let y = 0; y < copyBuffer.height; y++) {
        const i = (y * copyBuffer.width + x) * 4;
        copyBuffer.data[i+0] = t.data.data[i+0];
        copyBuffer.data[i+1] = t.data.data[i+1];
        copyBuffer.data[i+2] = t.data.data[i+2];
        copyBuffer.data[i+3] = t.data.data[i+3];
      }
    }
  }

  function paste(overwrite: boolean = true) {
    // TODO: What about expanding the width/height of the tileset?
    const t = getTileBuffer();
    if (!t) return;
    if (!copyBuffer) return;
    pushStack(t, undoStack);
    for (let x = 0; x < copyBuffer.width; x++) {
      for (let y = 0; y < copyBuffer.height; y++) {
        const i = (y * copyBuffer.width + x) * 4;
        const r = copyBuffer.data[i+0];
        const g = copyBuffer.data[i+1];
        const b = copyBuffer.data[i+2];
        const a = copyBuffer.data[i+3];
        if (overwrite) {
          t.data.data[i+0] = r;
          t.data.data[i+1] = g;
          t.data.data[i+2] = b;
          t.data.data[i+3] = a;
        } else {
          t.data.data[i+0] ||= r;
          t.data.data[i+1] ||= g;
          t.data.data[i+2] ||= b;
          t.data.data[i+3] ||= a;
        }
      }
    }
    t.dirty = true;
    setTileBuffer(t);
  }

  function flip(axis: string) {
    copy();
    if (!copyBuffer) return;
    const flip = new ImageData(copyBuffer.width, copyBuffer.height);
    for (let x = 0; x < flip.width; x++) {
      for (let y = 0; y < flip.height; y++) {
        const i = (y * flip.width + x) * 4;
        let j: number;
        if (axis === 'x') {
          j = (y * flip.width + (flip.width-x)) * 4;
        } else {
          j = ((flip.height-y) * flip.width + x) * 4;
        }
        flip.data[i+0] = copyBuffer.data[j+0];
        flip.data[i+1] = copyBuffer.data[j+1];
        flip.data[i+2] = copyBuffer.data[j+2];
        flip.data[i+3] = copyBuffer.data[j+3];
      }
    }
    copyBuffer = flip;
    paste();
    copyBuffer = undefined;
  }

  function rotate() {
    copy();
    if (!copyBuffer) return;
    copyBuffer = rotsprite(copyBuffer, degrees);
    paste();
    copyBuffer = undefined;
  }

  function move(ox: number, oy: number) {
    copy();
    if (!copyBuffer) return;
    const dest = new ImageData(copyBuffer.width, copyBuffer.height);
    for (let x = 0; x < dest.width; x++) {
      for (let y = 0; y < dest.height; y++) {
        const i = (y * dest.width + x) * 4;
        const j = ((y-oy) * dest.width + (x-ox)) * 4;
        dest.data[i+0] = copyBuffer.data[j+0];
        dest.data[i+1] = copyBuffer.data[j+1];
        dest.data[i+2] = copyBuffer.data[j+2];
        dest.data[i+3] = copyBuffer.data[j+3];
      }
    }
    copyBuffer = dest;
    paste();
    copyBuffer = undefined;
  }

  function clear() {
    copyBuffer = new ImageData(tileset.tilewidth, tileset.tileheight);
    paste();
    copyBuffer = undefined;
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
      <button on:click={() => flip('x')} disabled={tileset.selectedTiles.length !== 1}>
        <Icon name="flipHoriz" />
      </button>
      <button on:click={() => flip('y')} disabled={tileset.selectedTiles.length !== 1}>
        <Icon name="flipVert" />
      </button>
      <button on:click={rotate} disabled={tileset.selectedTiles.length !== 1}>
        <Icon name="cropRotateTl" />
        <input
          type="number"
          min="0" max="90" bind:value={degrees}
          on:click={(e) => e.stopPropagation()}
          disabled={tileset.selectedTiles.length !== 1} />
      </button>
      <button on:click={undo} disabled={undoStack.length === 0}>
        <Icon name="undo" />
      </button>
      <button on:click={redo} disabled={redoStack.length === 0}>
        <Icon name="redo" />
      </button>
      <button on:click={clear} disabled={tileset.selectedTiles.length !== 1}>
        <Icon name="deleteCircle" />
      </button>
      <button on:click={copy} disabled={tileset.selectedTiles.length !== 1}>
        <Icon name="copy" />
      </button>
      <button on:click={() => paste(false)} disabled={tileset.selectedTiles.length !== 1 || !copyBuffer}>
        <Icon name="pasteClipboard" />
      </button>
      <button disabled={!tileset.loaded()} on:click={save}>
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