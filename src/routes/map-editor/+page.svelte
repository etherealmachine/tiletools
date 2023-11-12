<script lang="ts">
  import Tilemap from "$lib/Tilemap";
  import MapEditor from "$lib/MapEditor.svelte";
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type Tileset from "$lib/Tileset";
  import { browser } from "$app/environment";
    import { onMount } from "svelte";

  let tileset: Tileset | undefined;
  let map: Tilemap | undefined;

  function mapChanged(map: Tilemap | undefined) {
    if (map && map.tileset) {
      tileset = map.tileset;
    }
  }

  function tilesetChanged(tileset: Tileset | undefined) {
    if (map && tileset) {
      map.tileset = tileset;
    }
  }

  $: mapChanged(map)
  $: tilesetChanged(tileset);

  let autosaver: number | undefined;

  function updateAutosave(_: any) {
    if (browser) {
      clearTimeout(autosaver);
      autosaver = setTimeout(autosave, 5000);
    }
  }

  function autosave() {
    if (!browser || !map) return;
    const png = map.png();
    if (png) {
      localStorage.setItem("tilemap", png.dataURL());
    }
  }

  onMount(() => {
    const url = localStorage.getItem("tilemap");
    if (url) {
      Tilemap.from(url).then(_map => {
        map= _map;
      });
    }
  });

  $: updateAutosave(map);
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  <TilesetEditor bind:tileset maxWidth="30%" />
  <MapEditor bind:map />
</div>
