<script lang="ts">
  import MapEditor from "$lib/MapEditor.svelte";
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type Tileset from "$lib/Tileset";

  let tileset: Tileset;
  let selectedTileX: number, selectedTileY: number;
</script>

<div style="display: flex; gap: 16px; justify-content: space-between; width: 100%;">
  <TilesetEditor
    bind:tileset={tileset}
    maxWidth="30%"
  />
  <MapEditor
    bind:tileset={tileset}
  />
</div>