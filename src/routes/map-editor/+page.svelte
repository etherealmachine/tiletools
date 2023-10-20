<script lang="ts">
  import MapEditor, { type Layer } from "$lib/MapEditor.svelte";
  import TilesetEditor from "$lib/TilesetEditor.svelte";
  import type Tileset from "$lib/Tileset";
    import { onMount } from "svelte";

  let tileset: Tileset;
  let layers: Layer[];

    /*
    TODO: persist state during reload
  function persistStateInURL(tileset: Tileset, layers: Layer[]) {
    if (typeof window !== 'undefined') {
      const state = btoa(JSON.stringify({
        tileset: tileset,
        layers: layers,
      }));
      const url = new URL(window.location.href);
      url.searchParams.set('state', state);
      window.history.replaceState({}, '', url.toString());
    }
  }

  $: persistStateInURL(tileset, layers);

  onMount(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const stateString = url.searchParams.get('state');
      if (stateString) {
        const state = JSON.parse(atob(stateString));
        tileset = state.tileset;
        layers = state.layers;
      }
    }
  });
    */
</script>

<div style="display: flex; gap: 16px; justify-content: space-between; width: 100%;">
  <TilesetEditor
    bind:tileset={tileset}
    maxWidth="30%"
  />
  <MapEditor
    bind:tileset={tileset}
    bind:layers={layers}
  />
</div>