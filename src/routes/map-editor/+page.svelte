<script lang="ts">
  import MapEditor, { type Layer } from "$lib/MapEditor.svelte";
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type Tileset from "$lib/Tileset";

  let tileset: Tileset;
  let layers: Layer[];

  // TODO: Persist state during reload
</script>

<div style="display: flex; gap: 16px; justify-content: space-between; width: 100%;">
  <TilesetEditor
    bind:tileset={tileset}
    maxWidth="30%"
  />
  <MapEditor
    bind:tileset={tileset}
    bind:layers={layers}
  />
</div>