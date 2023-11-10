<script lang="ts">
  import type Tilemap from "$lib/Tilemap";
  import MapEditor from "$lib/MapEditor.svelte";
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type Tileset from "$lib/Tileset";

  let tileset: Tileset | undefined;
  let map: Tilemap | undefined;

  function mapChanged(map: Tilemap | undefined) {
    if (map && map.tileset) {
      tileset = map.tileset;
    }
  }

  function tilesetChanged(tileset: Tileset | undefined) {
    if (map) {
      map.tileset = tileset;
    }
  }

  $: mapChanged(map)
  $: tilesetChanged(tileset);
  // TODO: Persist state during reload
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  <TilesetEditor bind:tileset maxWidth="30%" />
  <MapEditor bind:map />
</div>
