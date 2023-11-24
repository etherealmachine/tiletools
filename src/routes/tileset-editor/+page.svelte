<script lang="ts">
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import Tileset from "$lib/Tileset";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  let tileset: Tileset;
  let autosaver: number | undefined;

  function updateAutosave(_: any) {
    if (browser) {
      clearTimeout(autosaver);
      autosaver = setTimeout(autosave, 5000);
    }
  }

  function autosave() {
    if (!browser) return;
    tileset.syncTiles().then((tileset) => {
      const png = tileset.png();
      if (png) {
        localStorage.setItem("tileset", png.dataURL());
      }
    });
  }

  onMount(() => {
    const url = localStorage.getItem("tileset");
    if (url) {
      Tileset.from(url).then((_tileset) => {
        tileset = _tileset;
      });
    }
  });

  $: updateAutosave(tileset);
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  <TilesetEditor bind:tileset />
</div>
