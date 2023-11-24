<script lang="ts" context="module">
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import type Scene from "./Scene";
  import PNGWithMetadata from "./PNGWithMetadata";
  import Point from "./Point";
  import FOV from "./fov";
    import { drawCharacter, drawRect } from "./draw";

  export let scene: Scene;

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
    const { camera, tilemap } = scene;
    if (!tilemap.tileset) {
      requestAnimationFrame(draw);
      return;
    }
    const [w, h] = [tilemap.tileset.tilewidth, tilemap.tileset.tileheight];
    for (let c of scene.characters) {
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
        const pos = Point.from(loc);
        if (scene.fov) {
          if (scene.seen[loc] || scene.fov.lit.find(litPos => litPos.equals(pos))) {
            tilemap.tileset.drawTile(ctx, pos, tile);
          }
        } else {
          tilemap.tileset.drawTile(ctx, pos, tile);
        }
      }
    }
    for (let loc of Object.keys(scene.seen)) {
      const pos = Point.from(loc);
      if (scene.fov && !scene.fov.lit.find(litPos => litPos.equals(pos))) {
        ctx.fillStyle = '#000000aa';
        ctx.strokeStyle = '#00000000';
        drawRect(ctx, pos.x*tilemap.tileset.tilewidth, pos.y*tilemap.tileset.tileheight, tilemap.tileset.tilewidth, tilemap.tileset.tileheight, true);
      }
    }
    for (let c of scene.characters) {
      drawCharacter(ctx, c, tilemap.tileset);
    }
    requestAnimationFrame(draw);
  }

  function onPointerDown(e: PointerEvent) {}

  function onPointerUp(e: PointerEvent) {}

  function onPointerCancel(e: PointerEvent) {}

  function onPointerMove(e: PointerEvent) {}

  function onWheel(e: WheelEvent) {
    const { camera } = scene;
    if (e.deltaY < 0) {
      camera.zoom *= 1.1;
    } else if (e.deltaY > 0) {
      camera.zoom *= 0.9;
    }
    camera.zoom = Math.min(Math.max(0.25, camera.zoom), 8);
  }

  function onKeyDown(e: KeyboardEvent) {
    const p = scene.currentPlayer();
    if (!p) return;
    switch (true) {
      case e.key === "ArrowLeft":
        scene.moveCharacter(p, -1, 0);
        e.preventDefault();
        break;
      case e.key === "ArrowRight":
        scene.moveCharacter(p, 1, 0);
        e.preventDefault();
        break;
      case e.key === "ArrowUp":
        scene.moveCharacter(p, 0, -1);
        e.preventDefault();
        break;
      case e.key === "ArrowDown":
        scene.moveCharacter(p, 0, 1);
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
