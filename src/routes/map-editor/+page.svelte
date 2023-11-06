<script lang="ts">
  import type Tilemap from "$lib/Tilemap";
  import MapEditor from "$lib/MapEditor.svelte";
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type Tileset from "$lib/Tileset";

  let tileset: Tileset;
  let map: Tilemap;

  function onChange(map: Tilemap, tileset: Tileset) {
    if (map) map.tileset = tileset;
    if (map && map.tileset) tileset = map.tileset;
  }

  $: onChange(map, tileset);
  // TODO: Persist state during reload
</script>

<div style="display: flex; gap: 16px; justify-content: space-between; width: 100%;">
  <TilesetEditor
    bind:tileset={tileset}
    maxWidth="30%"
  />
  <MapEditor
    bind:map={map}
  />
</div>