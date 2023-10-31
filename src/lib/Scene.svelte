<script lang="ts" context="module">
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import type { Camera, Character, Tilemap } from "./ECS";
  import type ECS from "./ECS";
    import { PNGWithMetadata } from "./PNGWithMetadata";

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
          tilemap.tileset.drawTile(ctx, x, y, tile.tileX, tile.tileY);
        });
      });
      ecs.all<Character>('Character').forEach(c => {
        if (typeof(c.portrait) === 'string') {
          PNGWithMetadata.fromDataURL(c.portrait).bitmap().then(img => {
            c.portrait = img;
          });
        } else if (c.portrait instanceof ImageBitmap) {
          ctx.drawImage(c.portrait, c.position.x*tilemap.tileset.tilewidth, c.position.y*tilemap.tileset.tilewidth);
        }
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
    const camera = ecs.get<Camera>('Camera');
    if (!camera) return;
    const tilemap = ecs.get<Tilemap>('Tilemap');
    if (!tilemap) return;
    switch (true) {
      case e.key === "ArrowLeft":
        camera.centerX -= camera.zoom*tilemap.tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowRight":
        camera.centerX += camera.zoom*tilemap.tileset.offsetWidth();
        e.preventDefault();
        break;
      case e.key === "ArrowUp":
        camera.centerY -= camera.zoom*tilemap.tileset.offsetHeight();
        e.preventDefault();
        break;
      case e.key === "ArrowDown":
        camera.centerY += camera.zoom*tilemap.tileset.offsetHeight();
        e.preventDefault();
        break;
    }
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