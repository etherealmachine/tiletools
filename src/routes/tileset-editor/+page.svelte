<script lang="ts">
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import Tileset from "$lib/Tileset";
  import LocalStorage from "$lib/LocalStorage";
  import { browser } from "$app/environment";
    import { onMount } from "svelte";

  let tileset: Tileset | undefined;
  let storage: LocalStorage | undefined;
  if (browser) {
    storage = new LocalStorage("tileset");
  }

  onMount(async () => {
    if (browser && storage) {
      const saved = storage.get();
      if (saved) {
        tileset = await Tileset.from(saved);
      }
    }
  });

  $: if (tileset && storage) storage.set(tileset);
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  <TilesetEditor bind:tileset bind:storage />
</div>
