<script lang="ts">
  import Scene from "$lib/Scene.svelte";
  import RPGEngine from "$lib/RPGEngine";
  import Tilemap from "$lib/Tilemap";

  let engine: RPGEngine;

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    Tilemap.from(file).then(tilemap => {
      engine = new RPGEngine(
        {
          centerX: 0,
          centerY: 0,
          zoom: 1,
        },
        tilemap,
      );
    });
  }
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  {#if engine}
    <Scene {engine} />
  {:else}
    <input type="file" accept="image/png" on:change={onLoad} />
  {/if}
</div>
