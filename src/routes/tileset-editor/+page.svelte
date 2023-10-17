<script lang="ts">
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type { Tileset } from "$lib/types";

  let tileset: Tileset;
  let selectedTileX: number, selectedTileY: number;
</script>

<div style="display: flex; gap: 16px; justify-content: space-between; width: 100%;">
  <TilesetEditor
    bind:tileset={tileset}
    bind:selectedTileX={selectedTileX}
    bind:selectedTileY={selectedTileY}
  />
</div>