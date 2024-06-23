<script lang="ts" context="module">
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import type Scene from "./Scene";
  import CharacterEditor from "./CharacterEditor.svelte";
  import Point from "./Point";
  import Entity from "./Entity.svelte";

  export let scene: Scene;

  let canvas: HTMLCanvasElement;
  let mouse: Point | undefined;

  function draw() {
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    scene.draw(canvas, mouse);
    requestAnimationFrame(draw);
  }

  function onPointerDown(e: PointerEvent) {
    scene.toggleSelect(new Point(e.offsetX, e.offsetY));
    scene = scene;
  }

  function onPointerUp(e: PointerEvent) {}

  function onPointerCancel(e: PointerEvent) {}

  function onPointerMove(e: PointerEvent) {
    mouse = new Point(e.offsetX, e.offsetY);
  }

  function onWheel(e: WheelEvent) {
    const { camera } = scene;
    const p = scene.currentPlayer();
    if (!p) return;
    if (e.deltaY < 0) {
      camera.zoomTo(0.1);
    } else if (e.deltaY > 0) {
      camera.zoomTo(-0.1);
    }
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
      tabindex="0"
      on:wheel={onWheel}
      on:pointerdown={onPointerDown}
      on:pointerup={onPointerUp}
      on:pointercancel={onPointerCancel}
      on:pointermove={onPointerMove}
      on:keydown={onKeyDown}
      bind:this={canvas}
    />
  </div>
  <div style="display: flex; flex-direction: column;">
    {#each [0] as _}
      {@const character = scene.currentPlayer()}
      {#if character}
        <CharacterEditor {character} />
      {/if}
      {#each scene.selected() as selected}
        <Entity {scene} entity={selected} />
      {/each}
    {/each}
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
