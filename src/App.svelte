<script lang="ts">
    import TilesetEditor from "./lib/TilesetEditor.svelte";

    let tileset: HTMLImageElement;
    let tileWidth: number, tileHeight: number;
    let selectedTileX: number, selectedTileY: number;
</script>

<div style="display: flex; gap: 16px; justify-content: space-between; width: 100%;">
  <TilesetEditor
    bind:tileset={tileset}
    bind:tileWidth={tileWidth}
    bind:tileHeight={tileHeight}
    bind:selectedTileX={selectedTileX}
    bind:selectedTileY={selectedTileY}
  />
</div>

<style>
</style>
