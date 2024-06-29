<script lang="ts">
  import { onMount } from "svelte";
  import { Camera } from "./Camera";
  import Tileset from "./Tileset";
  import Point from "./Point";
  import HexMap from "./HexMap";

  let canvas: HTMLCanvasElement | undefined;
  let hoverAside: HTMLElement | undefined;
  let map: HexMap = new HexMap(20);
  let camera: Camera = new Camera();
  let hoverText: string | undefined;
  let mouse: Point = new Point(-1, -1);
  let mouseOver: boolean = false;

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
    Object.entries(map.tiledata.data).forEach(([key, entry]) => {
      const tile = Point.from(key);
      const loc = map.tileset.tileToWorld(tile);
      const height = entry['height'] as number | undefined;
      if (height !== undefined) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(height.toFixed(2), loc.x, loc.y);
      }
    });
  }

  function onPointerMove(e: PointerEvent) {
    mouse = camera.screenToWorld(new Point(e.offsetX, e.offsetY));
    const tile = map.tileset.worldToTile(mouse);
    hoverText = map.tiledata.get<string | undefined>(tile, 'height');
  }

  onMount(async () => {
    const resp = await fetch("/weave/examples/Fantasy Hex.png");
    const blob = await resp.blob();
    const buf = await blob.arrayBuffer();
    map.tileset = await Tileset.from(buf);
    const findTile = (tag: string): Point => {
      const tiledata = map.tileset.tiledata.filter<Array<string>>("tags").find(([t, tags]) => {
        return tags.includes(tag);
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
    const mountain= findTile('mountains');

    map.initializeOcean();
    map.buildContinents();
    map.defineMountains();
    for (let [loc, data] of Object.entries(map.tiledata.data)) {
      const p = Point.from(loc);
      if (data['ocean'] !== undefined) {
        map.set(p, deep);
      } else if (data['border'] !== undefined) {
        map.set(p, mountain);
      } else if (data['continent'] !== undefined) {
        map.set(p, grass);
      }
    }
    requestAnimationFrame(draw);
  });
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
    {#if hoverText !== undefined}
      <aside style="position: absolute;" bind:this={hoverAside}>
        {hoverText}
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