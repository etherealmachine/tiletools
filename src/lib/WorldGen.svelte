<script lang="ts" context="module">
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import { Camera } from "./Camera";
    import Tileset from "./Tileset";
    import Tilemap from "./Tilemap";
    import Point from "./Point";

  let canvas: HTMLCanvasElement;
  let map: Tilemap = new Tilemap();
  let camera: Camera = new Camera();

  function draw() {
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
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
  }

  onMount(async () => {
    const resp = await fetch("/weave/examples/Fantasy Hex.png");
    const blob = await resp.blob();
    const buf = await blob.arrayBuffer();
    map.tileset = await Tileset.from(buf);
    const grassland = map.tileset.tiledata.filter<Array<string>>("tags").find(([t, tags]) => {
      return tags.includes('grassland');
    });
    if (grassland) {
      for (let x = -10; x <= 10; x++) {
        for (let y = -10; y <= 10; y++) {
          map.set(new Point(x, y), grassland[0]);
        }
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
    />
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