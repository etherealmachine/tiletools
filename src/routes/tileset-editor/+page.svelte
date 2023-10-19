<script lang="ts">
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type Tileset from "$lib/Tileset";

  let tileset: Tileset;
</script>

<div style="display: flex; gap: 16px; justify-content: space-between; width: 100%;">
  <TilesetEditor
    bind:tileset={tileset}
  />
</div>