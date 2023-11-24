<script lang="ts">
  import Scene from "$lib/Scene";
  import SceneUI from "$lib/Scene.svelte";
  import Tilemap from "$lib/Tilemap";

  let scene: Scene;

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    Tilemap.from(file).then(tilemap => {
      scene = new Scene(tilemap);
    });
  }
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  {#if scene}
    <SceneUI {scene} />
  {:else}
    <input type="file" accept="image/png" on:change={onLoad} />
  {/if}
</div>
