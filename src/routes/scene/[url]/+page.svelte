<script lang="ts">
  import { onMount } from "svelte";
  import type { ScenePage } from "./+page";
  import Tilemap from "$lib/Tilemap";
  import RPGEngine from "$lib/RPGEngine";
  import Scene from "$lib/Scene.svelte";

  export let data: ScenePage;
  let engine: RPGEngine | undefined;

  onMount(() => {
    fetch(`/weave/examples/${data.url}`).then(resp => {
      resp.arrayBuffer().then(buf => {
        Tilemap.from(buf).then(tilemap => {
          engine = new RPGEngine({
            centerX: 0,
            centerY: 0,
            zoom: 1,
          }, tilemap);
        });
      });
    });
  });
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  {#if engine}
    <Scene engine={engine} />
  {/if}
</div>
