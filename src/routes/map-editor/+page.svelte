<script lang="ts">
  import Tilemap from "$lib/Tilemap";
  import MapEditor from "$lib/MapEditor.svelte";
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type Tileset from "$lib/Tileset";
  import { browser } from "$app/environment";
  import LocalStorage from "$lib/LocalStorage";
  import { onMount } from "svelte";

  let tileset: Tileset | undefined;
  let map: Tilemap | undefined;
  let storage: LocalStorage | undefined;
  if (browser) {
    storage = new LocalStorage("tilemap");
  }

  function mapChanged(map: Tilemap | undefined) {
    if (map && map.tileset) {
      tileset = map.tileset;
      if (browser) {
        (window as any).map = map;
        if (storage) {
          storage.set(map);
        }
      }
    }
  }

  function tilesetChanged(tileset: Tileset | undefined) {
    if (map && tileset) {
      map.tileset = tileset;
    }
  }

  onMount(async () => {
    if (browser && storage) {
      const saved = storage.get();
      if (saved) {
        map = await Tilemap.from(saved);
      }
    }
  });

  $: mapChanged(map);
  $: tilesetChanged(tileset);
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  <TilesetEditor bind:tileset maxWidth="30%" />
  <MapEditor bind:map bind:storage />
</div>
