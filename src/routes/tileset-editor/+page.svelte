<script lang="ts">
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type Tileset from "$lib/Tileset";
  import LocalStorage from "$lib/LocalStorage";
    import { browser } from "$app/environment";

  let tileset: Tileset | undefined;
  let storage: LocalStorage | undefined;
  if (browser) {
    storage = new LocalStorage("tileset");
  }

  $: if (tileset && storage) storage.set(tileset);
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  <TilesetEditor bind:tileset bind:storage />
</div>
