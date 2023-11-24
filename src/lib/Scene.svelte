<script lang="ts" context="module">
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import type Scene from "./Scene";
  import CharacterEditor from "./CharacterEditor.svelte";

  export let scene: Scene;

  let canvas: HTMLCanvasElement;

  function draw() {
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    scene.draw(canvas);
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

<div style="display: flex; flex-direction: row; flex-grow: 1;">
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
  {#each [0] as _}
    {@const character = scene.currentPlayer()}
    {#if character}
      <CharacterEditor character={character} />
    {/if}
  {/each}
</div>

<style>
  .canvas {
    border: 2px solid white;
    margin: 0;
    padding: 0;
    flex-grow: 1;
  }
</style>
