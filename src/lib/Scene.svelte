<script lang="ts" context="module">
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import type RPGEngine from "./RPGEngine";
  import PNGWithMetadata from "./PNGWithMetadata";
    import { Point } from "./types";

  export let engine: RPGEngine;

  let canvas: HTMLCanvasElement | undefined;

  function draw() {
    if (!canvas) {
      requestAnimationFrame(draw);
      return;
    }
    const ctx = canvas.getContext("2d");
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
    const { camera, tilemap } = engine;
    if (!tilemap.tileset) {
      requestAnimationFrame(draw);
      return;
    }
    const [w, h] = [tilemap.tileset.tilewidth, tilemap.tileset.tileheight];
    for (let c of engine.characters) {
      if (camera && c.name === "Player") {
        camera.centerX = c.position.x * w;
        camera.centerY = c.position.y * h;
      }
    }
    ctx.setTransform(
      camera.zoom,
      0,
      0,
      camera.zoom,
      W / 2 - camera.centerX * camera.zoom,
      H / 2 - camera.centerY * camera.zoom,
    );
    for (let layer of tilemap.layers) {
      if (!layer.visible) continue;
      const sortedTiles = Object.entries(layer.tiles).sort((a, b): number => {
        const [x1, y1] = a[0].split(",").map((v) => parseInt(v));
        const [x2, y2] = b[0].split(",").map((v) => parseInt(v));
        if (y1 === y2) return x1 - x2;
        return y1 - y2;
      });
      for (let [loc, tile] of sortedTiles) {
        tilemap.tileset.drawTile(ctx, Point.from(loc), tile);
      }
    }
    for (let c of engine.characters) {
      if (typeof c.token === "string") {
        PNGWithMetadata.fromDataURL(c.token)
          .bitmap()
          .then((img) => {
            c.token = img;
          });
      } else if (c.token instanceof ImageBitmap) {
        const [x, y] = [c.position.x * w, c.position.y * h];
        ctx.drawImage(c.token, x, y, w, h);
        ctx.fillStyle = "red";
        ctx.fillRect(
          x,
          y - 1,
          tilemap.tileset.tilewidth * (c.health.current / c.health.max),
          1,
        );
      }
    }
    requestAnimationFrame(draw);
  }

  function onPointerDown(e: PointerEvent) {}

  function onPointerUp(e: PointerEvent) {}

  function onPointerCancel(e: PointerEvent) {}

  function onPointerMove(e: PointerEvent) {}

  function onWheel(e: WheelEvent) {
    const { camera } = engine;
    if (e.deltaY < 0) {
      camera.zoom *= 1.1;
    } else if (e.deltaY > 0) {
      camera.zoom *= 0.9;
    }
    camera.zoom = Math.min(Math.max(0.25, camera.zoom), 8);
  }

  function onKeyDown(e: KeyboardEvent) {
    const c = engine.characters.find((c) => c.name === "Player");
    if (!c) return;
    const { x, y } = c.position;
    switch (true) {
      case e.key === "ArrowLeft":
        c.position.x--;
        e.preventDefault();
        break;
      case e.key === "ArrowRight":
        c.position.x++;
        e.preventDefault();
        break;
      case e.key === "ArrowUp":
        c.position.y--;
        e.preventDefault();
        break;
      case e.key === "ArrowDown":
        c.position.y++;
        e.preventDefault();
        break;
    }
    for (let i = 0; i < engine.characters.length; i++) {
      const e = engine.characters[i];
      const d = Math.round(
        Math.sqrt(
          Math.pow(e.position.x - c.position.x, 2) +
            Math.pow(e.position.y - c.position.y, 2),
        ),
      );
      if (e.name !== "Player" && d === 0) {
        c.position.x = x;
        c.position.y = y;
        e.health.current -= Math.ceil(Math.random() * 3);
        if (e.health.current <= 0) {
          engine.characters.splice(i, 1);
        }
      }
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
