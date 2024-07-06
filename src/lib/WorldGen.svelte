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
  let map: HexMap = new HexMap(20);
  let camera: Camera = new Camera();
  let hoverText: string | undefined;
  let mouse: Point = new Point(-1, -1);
  let mouseOver: boolean = false;
  let visualizationOption: string | undefined;

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
    camera.zoom = 1;
    camera.centerOn(canvas, new Point(0, 0));
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
    map.draw(ctx);
    const elevationRange = map.elevationRange();
    Object.entries(map.tiledata.data).forEach(([key, entry]) => {
      const tile = Point.from(key);
      const loc = map.tileset.tileToWorld(tile);
      const elevation = entry['elevation'] as number | undefined;
      if (elevation !== undefined) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(elevation.toFixed(0), loc.x, loc.y);
      }
      const index = entry['index'] as number | undefined;
      if (index !== undefined) {
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#000';
        if (visualizationOption === 'Plates') {
          ctx.fillStyle = COLORS.spectrum[index];
        } else if (visualizationOption === 'Elevation') {
          const elevation = entry['elevation'] as number | undefined;
          if (elevation !== undefined) {
            if (elevation <= 0) {
              const i = Math.floor((COLORS.blue.length-1) * (Math.abs(elevation) / Math.abs(elevationRange[0])));
              ctx.fillStyle = COLORS.blue[i];
            } else {
              const i = Math.floor((COLORS.green.length-1) * (Math.abs(elevation) / Math.abs(elevationRange[1])));
              ctx.fillStyle = COLORS.green[i];
            }
          }
        }
        drawHexagon(ctx, loc.x, loc.y, map.tileset.radius(), true);
      }
    });
  }

  function onPointerMove(e: PointerEvent) {
    mouse = camera.screenToWorld(new Point(e.clientX, e.clientY));
    const tile = map.tileset.worldToTile(mouse);
    hoverText = "";
    const data = map.tiledata.data[tile.toString()];
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        hoverText += `${key}: ${value}\n`;
      });
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

    const grass = findTile('grassland');
    const shallow = findTile('shallow water');
    const deep = findTile('deep water');
    const hills = findTile('rocky hills');
    const desert = findTile('desert');
    const swamp = findTile('swamp', 'wet');
    const mountain = findTile('mountains');

    map.generate();
    /*
    for (let [loc, data] of Object.entries(map.tiledata.data)) {
      const p = Point.from(loc);
      const h = map.tiledata.get<number>(p, 'height') || 0;
      if (data['ocean'] !== undefined) {
        map.set(p, deep);
      } else if (data['mountain'] !== undefined) {
        map.set(p, mountain);
      } else if (data['river'] !== undefined) {
        map.set(p, shallow);
      } else if (data['continent'] !== undefined) {
        map.set(p, grass);
        if (h < 100) {
          map.set(p, swamp);
        } else {
          map.set(p, grass);
        }
      }
    }
    */
    requestAnimationFrame(draw);
  });

  function redraw(..._args: any[]) {
    if (browser) {
      requestAnimationFrame(draw);
    }
  }
  $: redraw(hoverAside, visualizationOption);
</script>

<div style="display: flex; flex-direction: row; flex-grow: 1;">
  <div class="canvas">
    <canvas
      style="position: absolute;"
      tabindex="0"
      bind:this={canvas}
      on:pointermove={onPointerMove}
      on:pointerenter={() => {
        mouseOver = true;
      }}
      on:pointerleave={() => {
        mouseOver = false;
      }}
    />
    <select style="position: absolute;" bind:value={visualizationOption}>
      <option>Plates</option>
      <option>Elevation</option>
    </select>
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