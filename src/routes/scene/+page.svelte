<script lang="ts">
  import { PNGWithMetadata } from "$lib/PNGWithMetadata";
  import Scene from "$lib/Scene.svelte";
  import { page } from '$app/stores';
  import Tileset from "$lib/Tileset";
  import ECS, { type Tilemap } from "$lib/ECS";
    import { onMount } from "svelte";

  const ecs = new ECS();
  onMount(() => {
    const map = $page.url.searchParams.get('map');
    if (map) {
      const png = PNGWithMetadata.fromDataURL(decodeURIComponent(map));
      const tilesetPNG = PNGWithMetadata.fromDataURL(png.metadata.tileset);
      const tileset = new Tileset(tilesetPNG.metadata);
      tileset.img = document.createElement('img');
      tileset.img.src = tilesetPNG.dataURL();
      ecs.add<Tilemap>("Tilemap", {
        layers: png.metadata.layers,
        tileset: tileset,
      });
    }
  });
</script>

<div style="display: flex; gap: 16px; justify-content: space-between; width: 100%;">
  <Scene ecs={ecs} />
</div>