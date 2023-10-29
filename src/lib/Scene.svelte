<script lang="ts" context="module">
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import type { Camera, Tilemap } from "./ECS";
  import type ECS from "./ECS";
  import { drawTile } from "./draw";

  export let ecs: ECS;

  let canvas: HTMLCanvasElement | undefined;

  function draw() {
    if (!canvas) {
      requestAnimationFrame(draw);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      requestAnimationFrame(draw);
      return;
    }
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.clearRect(0, 0, W, H);
    const camera = ecs.get<Camera>('Camera');
    if (camera) {
      ctx.setTransform(camera.zoom, 0, 0, camera.zoom, -camera.centerX, -camera.centerY);
    }
    const tilemap = ecs.get<Tilemap>('Tilemap');
    if (tilemap) {
      tilemap.layers.forEach(layer => {
        if (!layer.visible) return;
        Object.entries(layer.tiles).sort((a, b): number => {
          const [x1, y1] = a[0].split(',').map(v => parseInt(v));
          const [x2, y2] = b[0].split(',').map(v => parseInt(v));
          if (y1 === y2) return x1-x2;
          return y1-y2;
        }).forEach(entry => {
          const [x, y] = entry[0].split(',').map(v => parseInt(v));
          const tile = entry[1];
          drawTile(ctx, x, y, tilemap.tileset, tile.tileX, tile.tileY);
        });
      });
    }
    requestAnimationFrame(draw);
  }

  function onPointerDown(e: PointerEvent) {
  }

  function onPointerUp(e: PointerEvent) {
  }

  function onPointerCancel(e: PointerEvent) {
  }

  function onPointerMove(e: PointerEvent) {
  }

  function onWheel(e: WheelEvent) {
  }

  function onKeyDown(e: KeyboardEvent) {
  }

  onMount(() => {
    requestAnimationFrame(draw);
  });
</script>

<div style="display: flex; flex-direction: column; flex-grow: 1;">
  <div class="canvas">
    <canvas
      style="position: absolute;"
      tabindex="1"
      on:wheel={onWheel}
      on:pointerdown={onPointerDown}
      on:pointerup={onPointerUp}
      on:pointercancel={onPointerCancel}
      on:pointermove={onPointerMove}
      on:keydown={onKeyDown}
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