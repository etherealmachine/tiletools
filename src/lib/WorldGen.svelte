<script lang="ts">
  import { onMount } from "svelte";
  import { Camera } from "./Camera";
  import Tileset from "./Tileset";
  import Point from "./Point";
  import HexMap from "./HexMap";
  import { drawHexagon } from "./draw";
  import { browser } from "$app/environment";

  let canvas: HTMLCanvasElement | undefined;
  let hoverAside: HTMLElement | undefined;
  let map: HexMap = new HexMap();
  let camera: Camera = new Camera();
  let hoverText: string | undefined;
  let mouse: Point = new Point(-1, -1);
  let mouseOver: boolean = false;
  let visualizationOption: string | undefined;
  let showElevation: boolean = false;
  let path: Point[] | undefined;

  const COLORS = {
    spectrum: [
      '#8dd3c7',
      '#ffffb3',
      '#bebada',
      '#fb8072',
      '#80b1d3',
      '#fdb462',
      '#b3de69',
      '#fccde5',
      '#d9d9d9',
      '#bc80bd',
      '#ccebc5',
      '#ffed6f',
    ],
    red: [
      '#fff5f0',
      '#fee0d2',
      '#fcbba1',
      '#fc9272',
      '#fb6a4a',
      '#ef3b2c',
      '#cb181d',
      '#a50f15',
      '#67000d',
    ],
    green: [
      '#f7fcf5',
      '#e5f5e0',
      '#c7e9c0',
      '#a1d99b',
      '#74c476',
      '#41ab5d',
      '#238b45',
      '#006d2c',
      '#00441b',
    ],
    blue: [
      '#f7fbff',
      '#deebf7',
      '#c6dbef',
      '#9ecae1',
      '#6baed6',
      '#4292c6',
      '#2171b5',
      '#08519c',
      '#08306b',
    ],
    purple: [
      '#fcfbfd',
      '#efedf5',
      '#dadaeb',
      '#bcbddc',
      '#9e9ac8',
      '#807dba',
      '#6a51a3',
      '#54278f',
      '#3f007d',
    ]
  }

  function draw() {
    if (!canvas) return;
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(
      camera.zoom,
      0,
      0,
      camera.zoom,
      camera.offset.x,
      camera.offset.y,
    );
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ffffff77";
    ctx.font = '12px san-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    map.draw(ctx);
    const elevationRange = map.range('elevation');
    Object.entries(map.tiledata.data).forEach(([key, entry]) => {
      const tile = Point.from(key);
      const loc = map.tileset.tileToWorld(tile);
      const index = entry['index'] as number | undefined;
      const river = entry['river'] as boolean | undefined;
      const elevation = entry['elevation'] as number | undefined;
      if (index !== undefined) {
        ctx.fillStyle = '#000';
        if (visualizationOption === 'Plates') {
          ctx.fillStyle = COLORS.spectrum[index];
        } else if (visualizationOption === 'Elevation') {
          let color: string = '#fff';
          if (river) {
            color = COLORS.blue[COLORS.blue.length-1];
          } else if (elevation !== undefined && elevation <= 0) {
              const i = Math.floor((COLORS.blue.length-1) * (Math.abs(elevation) / Math.abs(elevationRange[0])));
              color = COLORS.blue[i];
          } else if (elevation !== undefined) {
              const i = Math.floor((COLORS.green.length-1) * (1 - (Math.abs(elevation) / Math.abs(elevationRange[1]))));
              color = COLORS.green[i];
          }
          ctx.fillStyle = color;
        } else if (visualizationOption === 'Watershed') {
          const shoreline = entry['shoreline'] as boolean | undefined;
          if (shoreline) {
            ctx.fillStyle = COLORS.blue[4];
          } else {
            const watershedIndex = entry['watershed'] as number | undefined;
            if (watershedIndex !== undefined) {
              ctx.fillStyle = COLORS.spectrum[watershedIndex];
            }
          }
        }
        drawHexagon(ctx, loc.x, loc.y, map.tileset.radius(), true);
        ctx.fillStyle = '#000';
        if (showElevation && elevation) {
          ctx.fillText(elevation?.toFixed(0).toString(), loc.x, loc.y);
        }
      }
    });
    if (path) {
      for (let i = 0; i < path.length; i++) {
        const p = path[i];
        ctx.fillStyle = COLORS.purple[COLORS.purple.length-1];
        const loc = map.tileset.tileToWorld(p);
        drawHexagon(ctx, loc.x, loc.y, map.tileset.radius(), true);
        ctx.fillStyle = '#fff';
        ctx.font = '20px san-serif';
        ctx.fillText(i.toString(), loc.x, loc.y);
      }
    }
  }

  function onPointerMove(e: PointerEvent) {
    mouse = camera.screenToWorld(new Point(e.clientX, e.clientY));
    hoverText = "";
    const data = map.tiledata.data[map.tileset.worldToTile(mouse).toString()];
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        hoverText += `${key}: ${value}\n`;
      });
      path = map.erodePath(map.tileset.worldToTile(mouse), true);
    } else {
      path = undefined;
    }
  }

  function onPointerDown(e: PointerEvent) {
    path = map.erodePath(map.tileset.worldToTile(mouse), false);
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
    switch (true) {
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
    }
  }

  onMount(async () => {
    const resp = await fetch("/weave/examples/Fantasy Hex.png");
    const blob = await resp.blob();
    const buf = await blob.arrayBuffer();
    map.tileset = await Tileset.from(buf);
    const findTile = (...findTags: string[]): Point => {
      const tiledata = map.tileset.tiledata.filter<Array<string>>("tags").find(([_t, tags]) => {
        return findTags.every(tag => tags.includes(tag));
      });
      if (tiledata) {
        return tiledata[0];
      }
      return new Point(0, 0);
    }

    /*
    const grass = findTile('grassland');
    const shallow = findTile('shallow water');
    const deep = findTile('deep water');
    const hills = findTile('rocky hills');
    const desert = findTile('desert');
    const swamp = findTile('swamp', 'wet');
    const mountain = findTile('mountains');
    */

    map.generate();
    if (canvas) {
      camera.zoom = 0.5;
      camera.centerOn(canvas, new Point(0, 0));
      requestAnimationFrame(draw);
    }
  });

  function redraw(..._args: any[]) {
    if (browser) {
      requestAnimationFrame(draw);
    }
  }
  $: redraw(mouse, camera, path, hoverText, visualizationOption, showElevation);
</script>

<div style="display: flex; flex-direction: row; flex-grow: 1;">
  <div class="canvas">
    <canvas
      style="position: absolute;"
      tabindex="0"
      bind:this={canvas}
      on:pointermove={onPointerMove}
      on:pointerenter={() => {
        canvas?.focus();
        mouseOver = true;
      }}
      on:pointerleave={() => {
        mouseOver = false;
      }}
      on:wheel={onWheel}
      on:pointerdown={onPointerDown}
      on:keydown={onKeyDown}
    />
    <div style="position: absolute; display: flex; align-items: center; gap: 8px">
      <select bind:value={visualizationOption}>
        <option>Plates</option>
        <option>Elevation</option>
        <option>Watershed</option>
      </select>
      <span>
        <input name="showElevation" type="checkbox" bind:checked={showElevation} />
        <label for="showElevation">Show Elevation</label>
      </span>
      <button on:click={() => { map.erode(); redraw() }}>Erode</button>
      <button on:click={() => { map.calculateWatershed(); redraw() }}>Watershed</button>
    </div>
    {#if hoverText !== undefined}
      <aside style="position: absolute; bottom: 0" bind:this={hoverAside}>
        <pre>{hoverText}</pre>
      </aside>
    {/if}
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